import { defineScript } from 'redis';

// The changeMessageVisibility LUA Script
//
// Parameters:
//
// KEYS[1]: the zset key
// KEYS[2]: the message id
//
//
// * Find the message id
// * Set the new timer
//
// Returns:
//
// 0 or 1

const CHANGE_MESSAGE_VISIBILITY = defineScript({
  transformArguments: (...args: any[]) => args,
  NUMBER_OF_KEYS: 2,
  SCRIPT: `
local msg = redis.call("ZSCORE", KEYS[1], KEYS[2])
if not msg then
  return 0
end
redis.call("ZADD", KEYS[1], KEYS[3], KEYS[2])
return 1`
});

export default CHANGE_MESSAGE_VISIBILITY;
