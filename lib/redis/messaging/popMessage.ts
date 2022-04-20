import { RedisContext } from '../context/RedisContext';
import getQueue from './getQueue';
import { Message } from './Message';

export declare interface PopMessageOptions {
  // LUA script
  sha1: Promise<string>;
}

function popMessage(
  this: RedisContext,
  qname: string,
  { }: PopMessageOptions
) {
  const key = [this.ns, qname].join(':');
  return new Promise<Message | null>((resolve, reject) => {
    getQueue.call(this, qname, false).then(q => {
      // Make really sure that the LUA script is loaded
      this.redis.evalSha(
        this.scripts.popMessage.SHA1,
        { keys: [], arguments: ['2', key, q.ts] }
      ).then(resp => {
        if (!Array.isArray(resp)) {
          resolve(null);
          return;
        }
        const [id, msg, rc, fr] = resp;
        resolve({
          id: String(id),
          message: String(msg),
          rc: String(rc),
          fr: Number(fr),
          sent: parseInt(String(id).slice(0, 10), 36) / 1000
        });
      }).catch(reject);
    }).catch(reject);
  });
}

export default popMessage;
