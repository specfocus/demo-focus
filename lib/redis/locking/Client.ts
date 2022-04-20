import Redis, { RedisClientType, RedisClusterType } from 'redis';

export type Client = RedisClientType<any> | RedisClusterType<any>;

export type ClientExecutionResult =
  | {
      client: Client;
      vote: 'for';
      value: number;
    }
  | {
      client: Client;
      vote: 'against';
      error: Error;
    };
