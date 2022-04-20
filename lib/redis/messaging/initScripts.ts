import { RedisClientType } from 'redis';
import * as SCRIPTS from './scripts';

export declare type ScriptKeys = Record<keyof typeof SCRIPTS, Promise<string>>;

async function initScripts(this: RedisClientType): Promise<ScriptKeys> {
  return Object.entries(SCRIPTS).reduce(
    (acc, [key, script]) => Object.assign(acc, { [key]: this.scriptLoad(script.SCRIPT) }),
    {} as ScriptKeys
  );
}

export default initScripts;
