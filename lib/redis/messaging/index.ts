import { RedisContext } from '../context/RedisContext';
import changeMessageVisibility from './changeMessageVisibility';
import createQueue from './createQueue';
import deleteMessage from './deleteMessage';
import deleteQueue from './deleteQueue';
import getQueueAttributes from './getQueueAttributes';
import listQueues from './listQueues';
import popMessage from './popMessage';
import receiveMessage from './receiveMessage';
import sendMessage from './sendMessage';
import setQueueAttributes from './setQueueAttributes';

// version of https://github.com/smrchy/rsmq/blob/master/_src/index.ts

const bind = (context: RedisContext) => ({
  changeMessageVisibility: changeMessageVisibility.bind(context),
  createQueue: createQueue.bind(context),
  deleteMessage: deleteMessage.bind(context),
  deleteQueue: deleteQueue.bind(context),
  getQueueAttributes: getQueueAttributes.bind(context),
  listQueues: listQueues.bind(context),
  popMessage: popMessage.bind(context),
  receiveMessage: receiveMessage.bind(context),
  sendMessage: sendMessage.bind(context),
  setQueueAttributes: setQueueAttributes.bind(context)
});

export default bind;
