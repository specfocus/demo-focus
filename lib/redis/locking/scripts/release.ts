import { defineScript } from 'redis';

const RELEASE = defineScript({
  transformArguments: (...args: any[]) => args,
  NUMBER_OF_KEYS: 0,
  SCRIPT: `
local count = 0
for i, key in ipairs(KEYS) do
  -- Only remove entries for *this* lock value.
  if redis.call('get', key) == ARGV[1] then
    redis.pcall('del', key)
    count = count + 1
  end
end
-- Return the number of entries removed.
return count`
});

export default RELEASE;
