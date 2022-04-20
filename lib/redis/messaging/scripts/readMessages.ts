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
local msgs = redis.call("ZRANGEBYSCORE", KEYS[1], "-inf", KEYS[2])
if #msgs == 0 then
  return {}
end
local r = {}
for _, msg in ipairs(msgs) do
  local mbody = redis.call("HGET", KEYS[1] .. ":Q", msg)
  local rc = redis.call("HINCRBY", KEYS[1] .. ":Q", msg .. ":rc", 1)
  local o = {msg, mbody, rc}
  table.insert(r, o)
end
return r`
});

export default RECEIVE_MESSAGE;
