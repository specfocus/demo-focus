import type { Redis, RedisContext } from './RedisContext';
import { getTruthy } from '@specfocus/spec-focus/promise';

const _connect = (redis: Redis): Promise<boolean> =>
  redis.connect()
    .then(() => true)
    .catch(
      e => {
        console.error(e);
        return false;
      }
    );

const connect = (context: RedisContext): RedisContext => {
  const { connected, redis, ...rest } = context;
  const isConnected = getTruthy(connected);
  
  if (isConnected && redis.isOpen) {
    return context;
  }

  if (!isConnected && redis.isOpen) {
    return {
      redis,
      connected: Promise.resolve(true),
      ...rest
    };
  }

  return {
    redis,
    connected: _connect(redis),
    ...rest
  };
};

export const connected = async (context: RedisContext): Promise<RedisContext> => {
  const result = connect(context);

  await result.connected;

  return result;
};

export const isConnected = ({ connected }: RedisContext): boolean => getTruthy(connected) || false;

export default connect;
