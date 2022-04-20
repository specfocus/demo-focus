import { createClient } from 'redis';
import * as SCRIPTS from '../scripts';
import type { Redis, RedisContext, Scripts } from './RedisContext';
import { deepFreeze } from '@specfocus/spec-focus/freeze';

const scripts = deepFreeze(SCRIPTS);

const create = (): RedisContext => {
  const client = createClient<Scripts>({
    scripts,
  });

  const redis: Redis = <any>client;

  return {
    connected: Promise.resolve(false),
    redis,
    scripts
  };
}

export default create;