import { Shape } from '@specfocus/main-focus/src/specs/any';

export type Document = Shape;

export interface Collection {
  records: Record<number, Document>;
  version: number;
}

export interface CollectionStore {
  [collectionName: string]: Collection;
}