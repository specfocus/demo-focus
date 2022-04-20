import { defineScript } from 'redis';

const ACQUIRE = defineScript({
  transformArguments: (...args: any[]) => args,
  NUMBER_OF_KEYS: 0,
  SCRIPT: `
-- Return 0 if an entry already exists.
for i, key in ipairs(KEYS) do
  if redis.call('exists', key) == 1 then
    return 0
  end
end
-- Create an entry for each provided key.
for i, key in ipairs(KEYS) do
  redis.call('set', key, ARGV[1], 'PX', ARGV[2])
end
-- Return the number of entries added.
return #KEYS`
});

export default ACQUIRE;