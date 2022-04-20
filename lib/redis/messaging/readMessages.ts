import { RedisContext, RedisCommandRawReply } from '../context/RedisContext';
import { QueueOptions } from './createQueue';
import getQueue from './getQueue';
import { Message } from './Message';

const translateReply = (reply: RedisCommandRawReply): Message[] => {
  console.log({ reply });
  if (!Array.isArray(reply)) {
    return [];
  }
  return reply.map(item => {
    if (!Array.isArray(item)) {
      return <Message>{};
    }
    const [id, msg, rc, fr] = item;
    return {
      id: String(id),
      message: String(msg),
      rc: String(rc),
      fr: Number(fr),
      sent: Number(parseInt(String(id).slice(0, 10), 36) / 1000)
    };
  });
};

function readMessages(
  this: RedisContext,
  qname: string,
  { vt }: Pick<QueueOptions, 'vt'>,
): Promise<Message[]> {
  const key = [this.ns, qname].join(':');
  return new Promise<Message[]>((resolve, reject) => {
    getQueue.call(this, qname, false).then(q => {
      console.log({ q });
      // Now that we got the default queue settings
      vt = vt != null ? vt : Number(q.vt);
      // Make really sure that the LUA script is loaded
      const { SCRIPT, SHA1 } = this.scripts.readMessages;
      const options = {
        arguments: ['3'],
        keys: [key, q.ts, String(Number(q.ts) + vt * 1000)]
      };
      console.log(options);
      this.redis.evalSha(SHA1, options)
        .then(translateReply)
        .then(resolve)
        .catch(e => {
          console.warn(e);
          this.redis.eval(SCRIPT, options)
            .then(translateReply)
            .then(resolve)
            .catch(reject);
        });
    }).catch(reject);
  });
}

export default readMessages;
