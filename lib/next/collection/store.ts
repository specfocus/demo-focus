import { Collection, CollectionStore, Document } from '@lib/main/collection/store';
import { isNil } from '@specfocus/main-focus/src/maybe';
import { atom, DefaultValue, selectorFamily } from 'recoil';

export const atomStore = atom<CollectionStore>({
  key: 'store',
  default: {},
  effects: []
});


export const selectorCollection = selectorFamily<Collection, string>({
  key: 'collection',
  get: (collectionName: string) => async ({ get }): Promise<Collection> => {
    const collections = get(atomStore);
    const { [collectionName]: val } = collections;
    if (val instanceof DefaultValue || isNil(val)) {
      return { records: {}, version: 0 };
    }
    return val;
  },
  set: (collectionName: string) => ({ get, set }, value) => {
    const collections = get(atomStore);
    const { [collectionName]: val, ...next } = collections;
    if (value instanceof DefaultValue || isNil(value)) {
    } else {
      Object.assign(next, { [collectionName]: value });
    }
    set(
      atomStore,
      next
    );
  }
});

export const selectorDocument = selectorFamily<Document | null, [string, number]>({
  key: 'collection/query',
  get: ([collectionName, documentKey]: [string, number]) => async ({ get }): Promise<Document | null> => {
    const collection = get(selectorCollection(collectionName));
    if (collection.version < 1) {
      return null;
    }
    const { [documentKey]: val } = collection.records;
    if (val instanceof DefaultValue || isNil(val)) {
      return null;
    }
    return val;
  },
  set: ([collectionName, documentKey]: [string, number]) => ({ get, set }, value) => {
    const remove = value instanceof DefaultValue || isNil(value);
    const { records, version } = get(selectorCollection(collectionName));
    if (version < -1 && remove) {
      return;
    }
    if (value instanceof DefaultValue || isNil(value)) {
      delete records[documentKey];
    } else {
      records[documentKey] = value;
    }
    set(
      selectorCollection(collectionName),
      { records, version: version + 1 }
    );
  }
});

export const useStore = () => {

};