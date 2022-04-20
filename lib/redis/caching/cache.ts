import NodeCache from 'node-cache';
import { RedisContext, connected } from '../context';

const PromiseCache = new NodeCache();

const logMiss = (key: string) => {
  console.warn(`MISSED ${key}`);
};

export async function getOrSet(
  this: RedisContext,
  key: string,
  resolve: () => Promise<string | null>
): Promise<string | null> {
  const { redis } = await connected(this);

  let value = await redis.get(key);

  if (value !== null) {
    return value;
  }

  // check for promise
  let promise = PromiseCache.get<Promise<string | null>>(key);

  if (promise) {
    value = await promise;

    if (typeof value !== 'string') {
      logMiss(key);
    }

    return value;
  }

  promise = resolve();

  // add promise
  PromiseCache.set(key, promise);

  value = await promise;

  if (typeof value === 'string') {
    redis.set(key, value).then(val => {
      // remove cached promise
      PromiseCache.del([key]);
    });
  } else {
    logMiss(key);
  }

  return value;
}

export async function getOrSetSimpleObject<T extends {}>(
  this: RedisContext,
  key: string,
  resolve: () => Promise<T | null>
): Promise<T | null> {
  const { redis } = await connected(this);

  const value = await getOrSet.call(
    this,
    key,
    () => resolve().then(data => data !== null ? JSON.stringify(data) : null)
  );
  return value !== null ? JSON.parse(value) : null;
}