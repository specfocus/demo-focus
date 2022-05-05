import { Collection, MongoClient } from 'mongodb';

class MongoCollectionContext {
  public static readonly create = (
    client: MongoClient,
    dbName: string,
    collectionName: string
  ) => {
    // TODO: perform validations
    return new MongoCollectionContext(client, dbName, collectionName);
  };
  constructor(
    public readonly client: MongoClient,
    public readonly dbName: string,
    public readonly collectionName: string
  ) {
  }

  get collection(): Collection {
    return this.client.db(this.dbName).collection(this.collectionName);
  }
}

export default  MongoCollectionContext;
