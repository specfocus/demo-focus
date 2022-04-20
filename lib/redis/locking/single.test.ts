import { formatWithOptions } from 'util';
import Redis, { RedisClientType, RedisClusterType} from 'redis';
import { ExecutionError, ResourceLockedError } from './error';
import Redlock from './Redlock';
import RedisCluster from '@node-redis/client/dist/lib/cluster';
import { Client } from './Client';

async function fail(
  error: unknown
): Promise<void> {
  if (!(error instanceof ExecutionError)) {
    throw error;
  }

  console.error(`${error.message}
---
${(await Promise.all(error.attempts))
  .map(
    (s, i) =>
      `ATTEMPT ${i}: ${formatWithOptions(
        { colors: true },
        {
          membershipSize: s.membershipSize,
          quorumSize: s.quorumSize,
          votesForSize: s.votesFor.size,
          votesAgainstSize: s.votesAgainst.size,
          votesAgainstError: s.votesAgainst.values(),
        }
      )}`
  )
  .join('\n\n')}
`);
}

async function waitForRedisCluster(redis: RedisClusterType): Promise<void> {
  async function checkIsReady(): Promise<boolean> {
    const promises = redis.getMasters().map(master => master.client.ping().then(res => res === '+PONG'));
    const results = await Promise.all(promises);
    return results.some(res => !res);
    /*
    return ((await redis.RedisCluster('info')) as string).match(
      /^RedisCluster_state:(.+)$/m
    )?.[1] === 'ok';*/
  }

  let isReady = await checkIsReady();
  while (!isReady) {
    console.log('Waiting for RedisClusterTypeto be ready...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isReady = await checkIsReady();
  }

  async function checkIsWritable(): Promise<boolean> {
    try {
      return ((await redis.set('isWritable', 'true')) as string) === 'OK';
    } catch (error) {
      console.error(`RedisClusterTypeunable to receive writes: ${error}`);
      return false;
    }
  }

  let isWritable = await checkIsWritable();
  while (!isWritable) {
    console.log('Waiting for RedisClusterTypeto be writable...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isWritable = await checkIsWritable();
  }
}

function run(namespace: string, redis: Client): void {
  beforeAll(async () => {
    await (redis instanceof RedisCluster && redis.isCluster
      ? waitForRedisCluster(redis)
      : null);
  });

  beforeAll(async () => {
    await redis.hKeys('*')
      .then((keys: string[]) => (keys?.length ? redis.del(keys) : null));
  });

  test(`${namespace} - acquires, extends, and releases a single lock`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Acquire a lock.
      let lock = await redlock.acquire(['{redlock}a'], duration);
      expect(await redis.get('{redlock}a')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}a')) / 200)).toBe(Math.floor(duration / 200));

      // Extend the lock.
      lock = await lock.extend(3 * duration);
      expect(await redis.get('{redlock}a')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}a')) / 200)).toBe(Math.floor((3 * duration) / 200));

      // Release the lock.
      await lock.release();
      expect(await redis.get('{redlock}a')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  it(`${namespace} - acquires, extends, and releases a multi-resource lock`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Acquire a lock.
      let lock = await redlock.acquire(
        ['{redlock}a1', '{redlock}a2'],
        duration
      );
      expect(await redis.get('{redlock}a1')).toBe(lock.value);
      expect(await redis.get('{redlock}a2')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}a1')) / 200)).toBe(Math.floor(duration / 200));
      expect(Math.floor((await redis.pTTL('{redlock}a2')) / 200)).toBe(Math.floor(duration / 200));

      // Extend the lock.
      lock = await lock.extend(3 * duration);
      expect(await redis.get('{redlock}a1')).toBe(lock.value);
      expect(await redis.get('{redlock}a2')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}a1')) / 200)).toBe(Math.floor((3 * duration) / 200));
      expect(Math.floor((await redis.pTTL('{redlock}a2')) / 200)).toBe(Math.floor((3 * duration) / 200));

      // Release the lock.
      await lock.release();
      expect(await redis.get('{redlock}a1')).toBe(null);
      expect(await redis.get('{redlock}a2')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  test(`${namespace} - locks fail when redis is unreachable`, async () => {
    try {
      const redis = Redis.createClient({
        url: '127.0.0.1',
        // maxRetriesPerRequest: 0,
        // autoResendUnfulfilledCommands: false,
        // autoResubscribe: false,
        // retryStrategy: () => null,
        // reconnectOnError: () => false,
      });

      redis.on('error', () => {
        // ignore redis-generated errors
      });

      const redlock = new Redlock([redis]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);
      try {
        await redlock.acquire(['{redlock}b'], duration);
        throw new Error('This lock should not be acquired.');
      } catch (error) {
        if (!(error instanceof ExecutionError)) {
          throw error;
        }

        expect(error.attempts.length).toBe(11);

        for (const e of await Promise.allSettled(error.attempts)) {
          expect(e.status).toBe('fulfilled');
          if (e.status === 'fulfilled') {
            for (const v of Array.from(e.value?.votesAgainst?.values())) {
              expect(v.message).toBe('Connection is closed.');
            }
          }
        }
      }
    } catch (error) {
      fail(error);
    }
  });

  it(`${namespace} - locks automatically expire`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = 200;

      // Acquire a lock.
      const lock = await redlock.acquire(['{redlock}d'], duration);
      expect(await redis.get('{redlock}d')).toBe(lock.value);

      // Wait until the lock expires.
      await new Promise((resolve) => setTimeout(resolve, 300, undefined));

      // Attempt to acquire another lock on the same resource.
      const lock2 = await redlock.acquire(['{redlock}d'], duration);
      expect(await redis.get('{redlock}d')).toBe(lock2.value);

      // Release the lock.
      await lock2.release();
      expect(await redis.get('{redlock}d')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  test(`${namespace} - individual locks are exclusive`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Acquire a lock.
      const lock = await redlock.acquire(['{redlock}c'], duration);
      expect(await redis.get('{redlock}c')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}c')) / 200)).toBe(Math.floor(duration / 200));

      // Attempt to acquire another lock on the same resource.
      try {
        await redlock.acquire(['{redlock}c'], duration);
        throw new Error('This lock should not be acquired.');
      } catch (error) {
        if (!(error instanceof ExecutionError)) {
          throw error;
        }

        expect(error.attempts.length).toBe(11);

        for (const e of await Promise.allSettled(error.attempts)) {
          expect(e.status).toBe('fulfilled');
          if (e.status === 'fulfilled') {
            for (const v of Array.from(e.value?.votesAgainst?.values())) {
              if (!(v instanceof ResourceLockedError)) {
                console.error('The error must be a ResourceLockedError.');
              }
            }
          }
        }
      }

      // Release the lock.
      await lock.release();
      expect(await redis.get('{redlock}c')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  it(`${namespace} - overlapping multi-locks are exclusive`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Acquire a lock.
      const lock = await redlock.acquire(
        ['{redlock}c1', '{redlock}c2'],
        duration
      );
      expect(await redis.get('{redlock}c1')).toBe(lock.value);
      expect(await redis.get('{redlock}c2')).toBe(lock.value);
      expect(Math.floor((await redis.pTTL('{redlock}c1')) / 200)).toBe(Math.floor(duration / 200));
      expect(Math.floor((await redis.pTTL('{redlock}c2')) / 200)).toBe(Math.floor(duration / 200));

      // Attempt to acquire another lock with overlapping resources
      try {
        await redlock.acquire(['{redlock}c2', '{redlock}c3'], duration);
        throw new Error('This lock should not be acquired.');
      } catch (error) {
        if (!(error instanceof ExecutionError)) {
          throw error;
        }

        expect(await redis.get('{redlock}c1')).toBe(lock.value);
        expect(await redis.get('{redlock}c2')).toBe(lock.value);
        expect(await redis.get('{redlock}c3')).toBe(null);

        expect(error.attempts.length).toBe(11);

        for (const e of await Promise.allSettled(error.attempts)) {
          expect(e.status).toBe('fulfilled');
          if (e.status === 'fulfilled') {
            for (const v of Array.from(e.value?.votesAgainst?.values())) {
              if (!(v instanceof ResourceLockedError)) {
                console.error('The error must be a ResourceLockedError.');
              }
            }
          }
        }
      }

      // Release the lock.
      await lock.release();
      expect(await redis.get('{redlock}c1')).toBe(null);
      expect(await redis.get('{redlock}c2')).toBe(null);
      expect(await redis.get('{redlock}c3')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  it(`${namespace} - the \`using\` helper acquires, extends, and releases locks`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = 500;

      const valueP: Promise<string | null> = redlock.using(
        ['{redlock}x'],
        duration,
        {
          automaticExtensionThreshold: 200,
        },
        async (signal) => {
          const lockValue = await redis.get('{redlock}x');
          if (typeof lockValue !== 'string') {
            console.error('The lock value was not correctly acquired.');
          }

          // Wait to ensure that the lock is extended
          await new Promise((resolve) => setTimeout(resolve, 700, undefined));

          expect(signal.aborted).toBe(false);
          expect(signal.error).toBe(undefined);

          expect(await redis.get('{redlock}x')).toBe(lockValue);

          return lockValue;
        }
      );

      await valueP;

      expect(await redis.get('{redlock}x')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  test(`${namespace} - the \`using\` helper is exclusive`, async () => {
    try {
      const redlock = new Redlock([redis]);

      const duration = 500;

      let locked = false;
      const [lock1, lock2] = await Promise.all([
        await redlock.using(
          ['{redlock}y'],
          duration,
          {
            automaticExtensionThreshold: 200,
          },
          async (signal) => {
            expect(locked).toBe(false);
            locked = true;

            const lockValue = await redis.get('{redlock}y');
            if (typeof lockValue !== 'string') {
              console.error('The lock value was not correctly acquired.');
            }

            // Wait to ensure that the lock is extended
            await new Promise((resolve) => setTimeout(resolve, 700, undefined));

            expect(signal.error).toBe(undefined);
            expect(signal.aborted).toBe(false);

            expect(await redis.get('{redlock}y')).toBe(lockValue);

            locked = false;
            return lockValue;
          }
        ),
        await redlock.using(
          ['{redlock}y'],
          duration,
          {
            automaticExtensionThreshold: 200,
          },
          async (signal) => {
            expect(locked).toBe(false);
            locked = true;

            const lockValue = await redis.get('{redlock}y');
            if (typeof lockValue !== 'string') {
              console.error('The lock value was not correctly acquired.');
            }

            // Wait to ensure that the lock is extended
            await new Promise((resolve) => setTimeout(resolve, 700, undefined));

            expect(signal.error).toBe(undefined);
            expect(signal.aborted).toBe(false);

            expect(await redis.get('{redlock}y')).toBe(lockValue);

            locked = false;
            return lockValue;
          }
        ),
      ]);

      expect(lock1).not.toBe(lock2);

      expect(await redis.get('{redlock}y')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });
}

run('instance', Redis.createClient({ url: 'redis-single-instance' }));

run('RedisCluster', Redis.createCluster({ rootNodes: [{ url: 'redis-single-RedisCluster-1' }] }));