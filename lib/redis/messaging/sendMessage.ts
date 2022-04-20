import { RedisClientType } from 'redis';
import { RedisContext } from '../context/RedisContext';
import getQueue from './getQueue';
import { makeKey, Queue } from './Queue';

function sendMessage(
  this: RedisContext,
  qname: string,
  message: string,
  delay: number | null | undefined = undefined,
  realtime: boolean = false
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    getQueue.call(this, qname, true).then((q) => {
      // Now that we got the default queue settings
      delay = delay != null ? delay : q.delay;

      // Check the message
      if (typeof message !== 'string') {
        reject('messageNotString');
        return;
      }
      // Check the message size
      if (q.maxsize !== -1 && message.length > q.maxsize) {
        reject('messageTooLong');
        return;
      }
      // Ready to store the message
      const key = [this.ns, qname].join(':');
      const mc = [
        { args: ['zadd', key, q.ts, q.uid] },
        { args: ['hset', `${key}:Q`, q.uid, message] },
        { args: ['hincrby', `${key}:Q`, 'totalsent', String(1)] }
      ];

      if (realtime) {
        mc.push({ args: ['zcard', key] });
      }
      this.redis.multiExecutor(mc).then(reply => {
        console.log(reply);
        if (!Array.isArray(reply)) {
          reject('bad reply');
          return;
        }
        const [zadd, hset, totalsent, rt] = reply;
        if (realtime) {
          const msg = JSON.stringify({ id: q.uid, message, qname, ns: this.ns, rt });
          const channel = [this.ns, 'rt:', qname].join('');
          this.redis.publish(channel, msg);
        }
        resolve(q.uid);
      }).catch(reject);
    }).catch(reject);
  });
}

export default sendMessage;
