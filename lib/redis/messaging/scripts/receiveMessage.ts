import { defineScript } from 'redis';

// The receiveMessage LUA Script
//
// Parameters:
//
// KEYS[1]: the zset key
// KEYS[2]: the current time in ms
// KEYS[3]: the new calculated time when the vt runs out
//
// * Find a message id
// * Get the message
// * Increase the rc (receive count)
// * Use hset to set the fr (first receive) time
// * Return the message and the counters
//
// Returns:
//
// {id, message, rc, fr}
const RECEIVE_MESSAGE = defineScript({
  transformArguments: (...args: any[]) => args,
  NUMBER_OF_KEYS: 3,
  SCRIPT: `
local msg = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", KEYS[2], "LIMIT", "0", "1")
if #msg == 0 then
  return {KEYS[1], KEYS[2], KEYS[3], msg}
end
redis.call("ZADD", KEYS[1], KEYS[3], msg[1])
redis.call("HINCRBY", KEYS[1] .. ":Q", "totalrecv", 1)
local mbody = redis.call("HGET", KEYS[1] .. ":Q", msg[1])
local rc = redis.call("HINCRBY", KEYS[1] .. ":Q", msg[1] .. ":rc", 1)
local o = {msg[1], mbody, rc}
if rc==1 then
  redis.call("HSET", KEYS[1] .. ":Q", msg[1] .. ":fr", KEYS[2])
  table.insert(o, KEYS[2])
else
  local fr = redis.call("HGET", KEYS[1] .. ":Q", msg[1] .. ":fr")
  table.insert(o, fr)
end
return o`
});

export default RECEIVE_MESSAGE;
