import { RedisContext } from '../context/RedisContext';

function deleteMessage(
  this: RedisContext,
  qname: string,
  id: string
): Promise<boolean> {
  const key = [this.ns, qname].join(':');
  return new Promise<boolean>((resolve, reject) => {
    const key = [this.ns, qname].join(':');
    const mc = [
      ["zrem", key, id],
      ["hdel", `${key}:Q`, id, `${id}:rc`, `${id}:fr`]
    ];

    this.redis.multiExecute(mc).then(resp => {
      resolve(Array.isArray(resp) && resp[0] === 1 && Number(resp[1]) > 0);
    }).catch(reject);
  });
}

export default deleteMessage;
