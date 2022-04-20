import { RedisCommandRawReply } from '@node-redis/client/dist/lib/commands';
import { RedisContext } from '../context/RedisContext';
import { QueueOptions } from './createQueue';

const _makeid = (len: number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let i = 0;
  for (i = 0; i < len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const _formatZeroPad = (num: number, count: number) => ((Math.pow(10, count) + num) + '').substring(1);

export declare interface QueueInstance extends QueueOptions {
  ts: string;
  uid: string;
}

function getQueue(
  this: RedisContext,
  qname: string,
  uid: boolean
): Promise<QueueInstance> {
  const key = [this.ns, qname, 'Q'].join(':');
  return new Promise<QueueInstance>((resolve, reject) => {
    const mc = [
      { args: ['hmget', key, 'vt', 'delay', 'maxsize'] },
      { args: ['time'] }
    ];
    this.redis.multiExecutor(mc).then((res: RedisCommandRawReply) => {
      console.log(res);
      if (!Array.isArray(res)) {
        reject('queueNotFound');
        return;
      }
      const [queue, time] = res;
      if (!Array.isArray(queue) || !Array.isArray(time)) {
        reject('queueNotFound');
        return;
      }
      const [vt, delay, maxsize] = queue;
      if (vt === null || delay === null || maxsize === null) {
        reject('queueNotFound');
        return;
      }
      if (!Array.isArray(time)) {
        reject('timeNotFound');
        return;
      }
      const [timestamp, microseconds] = time;
      // Make sure to always have correct 6digit millionth seconds from redis
      const ms: any = _formatZeroPad(Number(delay), 6);
      //  Create the epoch time in ms from the redis timestamp
      const ts = timestamp + ms.toString(10).slice(0, 3);

      const q: any = {
        vt: vt ? parseInt(String(vt), 10) : 0,
        delay: parseInt(String(delay), 10),
        maxsize: parseInt(String(maxsize), 10),
        ts: ts
      };

      // Need to create a uniqueid based on the redis timestamp,
      // the queue name and a random number.
      // The first part is the redis time.toString(36) which
      // lets redis order the messages correctly even when they are
      // in the same millisecond.
      if (uid) {
        q.uid = (timestamp + ms).toString(36) + _makeid(22);
      }
      resolve(q);
    }).catch(reject);
  });
}

export default getQueue;
