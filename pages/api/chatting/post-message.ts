import { RedisContext } from '@lib/redis/context';
import sendMessage from '@lib/redis/messaging/sendMessage';

const postMessage = async (context: RedisContext, message: string, qname: any | undefined = 'public') => {
  const reply = await sendMessage.call(context, qname, message, 0, true).catch(error => ({ error }));
  return { qname, message, reply };
};

export default postMessage;
