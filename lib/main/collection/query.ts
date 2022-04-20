import { RawObject } from 'mingo/types';

export interface CollectionQuery {
  criteria: RawObject;
  // asc ordered keys
  index: number[];
}

export interface CollectionQueries {
  [queryName: string]: CollectionQuery;
}

export interface CollectionQueryStore {
  [collectionName: string]: CollectionQueries;
}
