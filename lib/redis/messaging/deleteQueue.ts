import { RedisClientType } from 'redis';
import { RedisContext } from '../context/RedisContext';
import { makeKey, Queue } from './Queue';

function deleteQueue(
  this: RedisContext,
  qname: string
): Promise<boolean> {
  const key = [this.ns, qname].join(':');
  return new Promise<boolean>((resolve, reject) => {
    this.redis.reply(
      [
        { args: ["del", `${key}:Q`, key] }, // The queue hash and messages zset
        { args: ["srem", `${this.ns}:QUEUES`, qname] }
      ]
    ).then(res => {
      const deleted = res.length > 0 && res.some(val => Boolean(val));
      resolve(deleted);
    }).catch(reject);
  });
}

export default deleteQueue;
