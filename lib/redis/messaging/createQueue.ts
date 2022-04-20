import { timeStamp } from 'console';
import type { RedisClientType } from 'redis';
import { RedisContext, TimeReply } from '../context/RedisContext';
import { makeQKey, Queue } from './Queue';

export const DEFAULT_DELAY = 0;
export const DEFAULT_MAXSIZE = 65536;
export const DEFAULT_VT = 30;

export declare interface QueueOptions {
  delay: number;
  maxsize: number;
  vt: number;
}

function createQueue(
  this: RedisContext,
  qname: string,
  {
    delay = DEFAULT_DELAY,
    maxsize = DEFAULT_MAXSIZE,
    vt = DEFAULT_VT
  }: QueueOptions
): Promise<number> {
  const key = [this.ns, qname, 'Q'].join(':');
  return new Promise<number>((resolve, reject) => {
    this.redis.time()
      .then((reply: any | TimeReply) => {
        console.log('TimeReply', reply);
        const timestamp = reply.valueOf();
        const { microseconds } = reply;
        console.log('TimeReply', { reply, timestamp, microseconds });
        this.redis.multiExecutor(
          [
            { args: ['hsetnx', key, 'vt', String(vt)] },
            { args: ['hsetnx', key, 'delay', String(delay)] },
            { args: ['hsetnx', key, 'maxsize', String(maxsize)] },
            { args: ['hsetnx', key, 'created', String(timestamp)] },
            { args: ['hsetnx', key, 'modified', String(timestamp)] }
          ]
        ).then(resp => {
          // We created a new queue
          // Also store it in the global set to keep an index of all queues
          console.log('created queue');
          this.redis.sAdd(`${this.ns}:QUEUES`, qname).then(resolve).catch(reject);
        }).catch(reject);
      })
      .catch(err => reject(err));
  });
}

export default createQueue;
