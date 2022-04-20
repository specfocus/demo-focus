import { RedisContext } from '../context/RedisContext';
import { QueueOptions } from './createQueue';
import getQueue from './getQueue';
import { makeKey } from './Queue';

export declare interface ChangeMessageVisibilityOptions extends Pick<QueueOptions, 'vt'> {
  id: string;
}

// This must be done via LUA script
// We can only set a visibility of a message if it really exists.
function changeMessageVisibility(
  this: RedisContext,
  qname: string,
  { id, vt }: ChangeMessageVisibilityOptions
) {
  const key = makeKey({ ns: this.ns, qname });
  return new Promise<any>((resolve, reject) => {
    getQueue.call(this, qname, false).then(q => {
      this.redis.evalSha(
        this.scripts.changeMessageVisibility.SHA1,
        {
          keys: [],
          arguments: ['3', key, id, q.ts + vt * 1000]
        }
      ).then(resp => {
        resolve(resp);
      });
    }).catch(reject);
  });
}

export default changeMessageVisibility;
