import type { createClient, createCluster } from 'redis';
import * as SCRIPTS from '../scripts';
export { RedisCommand, RedisCommandArguments, RedisCommandRawReply, RedisCommandReply, RedisModules, RedisPlugins, RedisScript, RedisScripts } from '@node-redis/client/dist/lib/commands';
export type TimeReply = Date & { microseconds: number }; // [timestamp, microseconds]

export declare type Scripts = typeof SCRIPTS;
export declare type Client = ReturnType<typeof createClient>;
export declare type Cluster = ReturnType<typeof createCluster>;
export declare type Redis = Client | Cluster;
export declare interface RedisContext {
  connected: Promise<boolean>;
  redis: Redis;
  ns?: string;
  scripts: Readonly<Scripts>;
}
