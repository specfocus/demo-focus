import { defineScript } from 'redis';

const EXTEND = defineScript({
  transformArguments: (...args: any[]) => args,
  NUMBER_OF_KEYS: 0,
  SCRIPT: `
-- Return 0 if an entry exists with a *different* lock value.
for i, key in ipairs(KEYS) do
  if redis.call('get', key) ~= ARGV[1] then
    return 0
  end
end
-- Update the entry for each provided key.
for i, key in ipairs(KEYS) do
  redis.call('set', key, ARGV[1], 'PX', ARGV[2])
end
-- Return the number of entries updated.
return #KEYS`
});

export default EXTEND;
