import { RedisContext } from '@lib/redis/context';
import receiveMessages from '@lib/redis/messaging/readMessages';

const readMessages = async (context: RedisContext, qname: any | undefined = 'public') => {
  const messages = await receiveMessages.call(context, qname, { vt: 60 }).catch(error => ['error', error]);
  return { messages, qname };
};

export default readMessages;