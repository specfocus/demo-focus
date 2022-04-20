import { RedisContext } from '@lib/redis/context';
import listQueues from '@lib/redis/messaging/listQueues';

const listRooms = async (context: RedisContext) => {
  const rooms = await listQueues.call(context);
  return { rooms };
};

export default listRooms;
