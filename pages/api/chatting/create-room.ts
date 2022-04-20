import { RedisContext } from '@lib/redis/context';
import createQueue from '@lib/redis/messaging/createQueue';

const createRoom = async (context: RedisContext, qname: string) => {
  const count = await createQueue.call(context, qname, { delay: 0, maxsize: 200, vt: 30 });
  return { qname, count };
};

export default createRoom;
