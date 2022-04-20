import type { RedisClientType } from 'redis';
import { RedisContext } from '../context/RedisContext';
import { QueueOptions } from './createQueue';
import { makeKey, Queue } from './Queue';
import { OPTIONS } from './setQueueAttributes';

export declare interface QueueAttributes extends QueueOptions {
  totalrecv: number;
  totalsent: number;
  created: number; // microseconds
  modified: number; // microseconds
  msgs: number;
  hiddenmsgs: number;
}

export const ATTRIBUTES = [...OPTIONS, 'totalrecv', 'totalsent', 'created', 'modified'];

function getQueueAttributes(
  this: RedisContext,
  qname: string
): Promise<QueueAttributes> {
  const key = [this.ns, qname].join(':');
  return new Promise<QueueAttributes>((resolve, reject) => {
    this.redis.time().then(({ microseconds }) => {
      // Get basic attributes and counter
      // Get total number of messages
      // Get total number of messages in flight (not visible yet)
      this.redis.reply(
        [
          { args: ['hmget', `${key}:Q`, ...ATTRIBUTES] },
          { args: ['zcard', key] },
          { args: ['zcount', key, String(microseconds) + '000', '+inf'] }
        ]
      ).then(([attrs, msgs, hiddenmsgs]) => {
        if (Array.isArray(attrs)) {
          const values = attrs.reduce(
            (acc, val, index) => Object.assign(acc, { [ATTRIBUTES[index]]: Number(val) || 0 }),
            {
              msgs: Number(msgs),
              hiddenmsgs: Number(hiddenmsgs)
            }
          );
          resolve(values as QueueAttributes);
        }
      }).catch(reject);
    });
  });
}

export default getQueueAttributes;
