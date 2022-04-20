import { formatWithOptions } from 'util';
import Redis, { RedisClientType, RedisClusterType } from 'redis';
import { ExecutionError, ResourceLockedError } from './error';
import Redlock from './Redlock';
import { Client } from './Client';

async function fail(
  error: unknown
): Promise<void> {
  if (!(error instanceof ExecutionError)) {
    throw error;
  }

  const log = `${error.message}
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
  `;

  console.error(log);
}

async function waitForCluster(redis: RedisClusterType): Promise<void> {
  async function checkIsReady(): Promise<boolean> {
    const promises = redis.getMasters().map(master => master.client.ping().then(res => res === '+PONG'));
    const results = await Promise.all(promises);
    return results.some(res => !res);
    /*
    return ((await redis.cluster('info')) as string).match(
      /^cluster_state:(.+)$/m
    )?.[1] === 'ok';*/
  }

  let isReady = await checkIsReady();
  while (!isReady) {
    console.log('Waiting for cluster to be ready...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isReady = await checkIsReady();
  }

  async function checkIsWritable(): Promise<boolean> {
    try {
      return ((await redis.set('isWritable', 'true')) as string) === 'OK';
    } catch (error) {
      console.error(`Cluster unable to receive writes: ${error}`);
      return false;
    }
  }

  let isWritable = await checkIsWritable();
  while (!isWritable) {
    console.log('Waiting for cluster to be writable...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isWritable = await checkIsWritable();
  }
}

function run(
  namespace: string,
  redisA: Client,
  redisB: Client,
  redisC: Client
): void {
  beforeAll(async () => {
    await Promise.all([
      redisA.isCluster
        ? waitForCluster(redisA as RedisClusterType)
        : null,
      redisB.isCluster
        ? waitForCluster(redisB as RedisClusterType)
        : null,
      redisC.isCluster
        ? waitForCluster(redisC as RedisClusterType)
        : null,
    ]);
  });

  beforeAll(async () => {
    const keysA = Object.keys(redisA.keys);
    const keysB = Object.keys(redisB.keys);
    const keysC = Object.keys(redisC.keys);
    await Promise.all([
      keysA.length ? redisA.del(keysA) : null,
      keysB.length ? redisB.del(keysB) : null,
      keysC.length ? redisC.del(keysC) : null
    ]);
  });

  it(`${namespace} - acquires, extends, and releases a single lock`, async () => {
    try {
      const redlock = new Redlock([redisA, redisB, redisC]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Acquire a lock.
      let lock = await redlock.acquire(['{redlock}a'], duration);
      expect(await redisA.get('{redlock}a')).toBe(lock.value);
      expect(await redisB.get('{redlock}a')).toBe(lock.value);
      expect(await redisC.get('{redlock}a')).toBe(lock.value);
      expect(Math.floor((await redisA.pTTL('{redlock}a')) / 200)).toBe(Math.floor(duration / 200));
      expect(Math.floor((await redisB.pTTL('{redlock}a')) / 200)).toBe(Math.floor(duration / 200));
      expect(Math.floor((await redisC.pTTL('{redlock}a')) / 200)).toBe(Math.floor(duration / 200));

      // Extend the lock.
      lock = await lock.extend(3 * duration);
      expect(await redisA.get('{redlock}a')).toBe(lock.value);
      expect(await redisB.get('{redlock}a')).toBe(lock.value);
      expect(await redisC.get('{redlock}a')).toBe(lock.value);
      expect(Math.floor((await redisA.pTTL('{redlock}a')) / 200)).toBe(Math.floor((3 * duration) / 200));
      expect(Math.floor((await redisB.pTTL('{redlock}a')) / 200)).toBe(Math.floor((3 * duration) / 200));
      expect(Math.floor((await redisC.pTTL('{redlock}a')) / 200)).toBe(Math.floor((3 * duration) / 200));

      // Release the lock.
      await lock.release();
      expect(await redisA.get('{redlock}a')).toBe(null);
      expect(await redisB.get('{redlock}a')).toBe(null);
      expect(await redisC.get('{redlock}a')).toBe(null);
    } catch (error) {
      fail(error);
    }
  });

  it(`${namespace} - succeeds when a minority of clients fail`, async () => {
    try {
      const redlock = new Redlock([redisA, redisB, redisC]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Set a value on redisC so that lock acquisition fails.
      await redisC.set('{redlock}b', 'other');

      // Acquire a lock.
      let lock = await redlock.acquire(['{redlock}b'], duration);
      expect(await redisA.get('{redlock}b')).toBe(lock.value);
      expect(await redisB.get('{redlock}b')).toBe(lock.value);
      expect(await redisC.get('{redlock}b')).toBe('other');
      expect(Math.floor((await redisA.pTTL('{redlock}b')) / 200)).toBe(Math.floor(duration / 200));
      expect(Math.floor((await redisB.pTTL('{redlock}b')) / 200)).toBe(Math.floor(duration / 200));
      expect(await redisC.pTTL('{redlock}b')).toBe(-1);

      // Extend the lock.
      lock = await lock.extend(3 * duration);
      expect(await redisA.get('{redlock}b')).toBe(lock.value);
      expect(await redisB.get('{redlock}b')).toBe(lock.value);
      expect(await redisC.get('{redlock}b')).toBe('other');
      expect(Math.floor((await redisA.pTTL('{redlock}b')) / 200)).toBe(Math.floor((3 * duration) / 200));
      expect(Math.floor((await redisB.pTTL('{redlock}b')) / 200)).toBe(Math.floor((3 * duration) / 200));
      expect(await redisC.pTTL('{redlock}b')).toBe(-1);

      // Release the lock.
      await lock.release();
      expect(await redisA.get('{redlock}b')).toBe(null);
      expect(await redisB.get('{redlock}b')).toBe(null);
      expect(await redisC.get('{redlock}b')).toBe('other');
      await redisC.del('{redlock}b');
    } catch (error) {
      fail(error);
    }
  });

  test(`${namespace} - fails when a majority of clients fail`, async () => {
    try {
      const redlock = new Redlock([redisA, redisB, redisC]);

      const duration = Math.floor(Number.MAX_SAFE_INTEGER / 10);

      // Set a value on redisB and redisC so that lock acquisition fails.
      await redisB.set('{redlock}c', 'other1');
      await redisC.set('{redlock}c', 'other2');

      // Acquire a lock.
      try {
        await redlock.acquire(['{redlock}c'], duration);
        throw new Error('This lock should not be acquired.');
      } catch (error) {
        if (!(error instanceof ExecutionError)) {
          throw error;
        }

        expect(error.attempts.length).toBe(11);

        expect(await redisA.get('{redlock}c')).toBe(null);
        expect(await redisB.get('{redlock}c')).toBe('other1');
        expect(await redisC.get('{redlock}c')).toBe('other2');

        for (const e of await Promise.allSettled(error.attempts)) {
          expect(e.status).toBe('fulfilled');
          if (e.status === 'fulfilled') {
            for (const v of Array.from(e.value?.votesAgainst?.values())) {
              try {
                expect(v instanceof ResourceLockedError).toBeTruthy();
              } catch (e) {
                console.error('The error was of the wrong type.');
              }
              expect(v.message).toBe('The operation was applied to: 0 of the 1 requested resources.');
            }
          }
        }
      }

      await redisB.del('{redlock}c');
      await redisC.del('{redlock}c');
    } catch (error) {
      fail(error);
    }
  });
}

run(
  'instance',
  Redis.createClient({ url: 'redis-multi-instance-a' }),
  Redis.createClient({ url: 'redis-multi-instance-b' }),
  Redis.createClient({ url: 'redis-multi-instance-c' })
);

run(
  'cluster',
  Redis.createCluster({ rootNodes: [{ url: 'redis-multi-cluster-a-1' }] }),
  Redis.createCluster({ rootNodes: [{ url: 'redis-multi-cluster-b-1' }] }),
  Redis.createCluster({ rootNodes: [{ url: 'redis-multi-cluster-c-1' }] })
);