import type { RedisClientType } from 'redis';
import { RedisContext } from '../context/RedisContext';
import getQueue from './getQueue';
import getQueueAttributes, { QueueAttributes } from './getQueueAttributes';
import { makeKey, Queue } from './Queue';

export declare interface QueueOptions {
  vt: number;
  delay: number;
  maxsize: number;
}

export const OPTIONS: (keyof QueueOptions)[] = ['vt', 'delay', 'maxsize'];

function setQueueAttributes(
  this: RedisContext,
  qname: string,
  options: Partial<QueueOptions>
): Promise<any> {
  const key = [this.ns, qname].join(':');
  return new Promise<QueueAttributes>((resolve, reject) => {
    const attrs: (keyof QueueOptions)[] = OPTIONS.reduce<any>(
      (acc, key) => {
        const val = options[key];
        if (val !== null) {
          acc.push(val);
        }
      },
      []
    );

    // Not a single key was supplied
    if (attrs.length === 0) {
      reject('noAttributeSupplied');
      return;
    }

    getQueue.call(this, qname, false).then(q => {
      this.redis.time().then(({ microseconds }) => {
        const mc = [
          { args: ['hset', `${key}:Q`, 'modified', String(microseconds)] }
        ];
        for (const attr of attrs) {
          mc.push({ args: ['hset', `${key}:Q`, attr, String(options[attr])] });
        };
        this.redis.reply(mc).then(() => {
          resolve(getQueueAttributes.call(this, qname));
        }).catch(reject);
      }).catch(reject);
  }).catch(reject);
});
}

export default setQueueAttributes;
