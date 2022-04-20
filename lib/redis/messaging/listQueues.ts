import { RedisContext } from '../context/RedisContext';

function listQueues(
  this: RedisContext
) {
  return new Promise<string[]>((resolve, reject) => {
    this.redis.sMembers(`${this.ns}:QUEUES`).then(res => resolve(res)).catch(reject);
  });
}

export default listQueues;
