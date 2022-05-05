import { MongoClient } from 'mongodb';
import assert from 'node:assert';
import performance from '../preformance';
import MongoCollectionContext from './collection';

const LOCAL_URL = 'mongodb://localhost:27017';

const factory = (() => {
  const client = new MongoClient(
    process.env.MONGO_URL || LOCAL_URL,
    {
      connectTimeoutMS: Number(process.env.MONGO_TIMEOUT) || 10,
      maxIdleTimeMS: Number(process.env.MONGO_IDLE_TIME) || 60 * 1000,
      maxPoolSize: Number(process.env.MONGO_POOL_MAX) || 100,
      minPoolSize: Number(process.env.MONGO_POOL_MIN) || 0
    }
  );
  client.connect(async (err) => {
    assert.equal(null, err);
    // console.log("Connected successfully to server");
  });
  return () => new MongoContext(client);
})();

class MongoContext {
  public static readonly create = factory;

  private readonly _collections: Record<string, MongoCollectionContext> = {};

  constructor(
    public readonly client: MongoClient
  ) {
  }

  public readonly collection = (dbName: string, collectionName: string): MongoCollectionContext => {
    const key = `${dbName}.${collectionName}`;
    let { [key]: value } = this._collections;
    if (!value) {
      value = MongoCollectionContext.create(this.client, dbName, collectionName);
      Object.assign(this._collections, { [key]: value });
    }
    return value;
  }

  public readonly performance = (dbName: string) => performance(this.client, dbName);
}

export default MongoContext;
