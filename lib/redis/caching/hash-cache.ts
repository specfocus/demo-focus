import NodeCache from 'node-cache';
import type { RedisContext } from '../context';

const PromiseCache = new NodeCache();

const isNil = (value: unknown) => value === null || typeof value === 'undefined';

const logMiss = (key: string) => {
  console.warn(`MISSED ${key}`);
};

export async function getOrSetOne(
  this: RedisContext,
  key: string,
  field: string,
  resolve: () => Promise<string | undefined>
): Promise<string | undefined> {
  let value = await this.redis.hGet(key, field);

  if (value !== null) {
    return value;
  }

  // check for promise
  let promise = PromiseCache.get<Promise<string | undefined>>(key);

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
    this.redis.hSet(key, field, value).then(val => {
      // remove cached promise
      PromiseCache.del([key]);
    });
  } else {
    logMiss(key);
  }

  return value;
}

export async function getOrSetAll(
  this: RedisContext,
  key: string,
  resolve: () => Promise<Record<string, string>>
) {
  let value = await this.redis.hGetAll(key);

  if (value !== null) {
    return value;
  }

  // check for promise
  let promise = PromiseCache.get<Promise<Record<string, string> | undefined>>(key);

  if (promise) {
    const record = await promise;

    if (!record) {
      logMiss(key);
    }

    return record;
  }

  promise = resolve();

  // add promise
  PromiseCache.set(key, promise);

  const record = await promise;

  if (record) {
    for (const [field, value] of Object.entries(record)) {
      await this.redis.hSet(key, field, value);
    }
    PromiseCache.del([key]);
  } else {
    logMiss(key);
  }

  return record;
};

export async function getOrSetMany(
  this: RedisContext,
  key: string,
  fields: string[],
  resolve: () => Promise<Record<string, string>>
): Promise<Record<string, string>> {
  const record: Record<string, string> = {};

  for (const field of fields) {
    const value = await this.redis.hGet(key, field);
    if (value !== null) {
      Object.assign(record, { [field]: value });
    }
  }

  if (Object.keys(record).length === fields.length) {
    return record
  }

  // check for promise
  let promise = PromiseCache.get<Promise<string | undefined>>(key);

  if (promise) {
    await promise;

    for (const field of fields) {
      const value = await this.redis.hGet(key, field);
      if (value !== null) {
        Object.assign(record, { [field]: value });
      }
    }

    return record;
  }

  promise = resolve();

  // add promise
  PromiseCache.set(key, promise);

  const data = await promise;

  for (const [field, value] of Object.entries(data)) {
    await this.redis.hSet(key, field, value);

    if (fields.includes(field)) {
      Object.assign(record, { [field]: value });
    }
  }

  PromiseCache.del([key]);

  return record;
}
