import { atom, DefaultValue, selectorFamily, useRecoilState, useRecoilValue } from 'recoil';
import type { CollectionQuery, CollectionQueries, CollectionQueryStore } from '@lib/main/collection/query';
import type { Document } from '@lib/main/collection/store';
import type { Options } from 'mingo/core';
import { isNil } from '@specfocus/main-focus/src/maybe';
import { RawObject } from 'mingo/types';
import { Query } from 'mingo';
import { selectorCollection } from './store';
import { useCallback, useMemo } from 'react';

export interface CollectionOptions {
  [collectionName: string]: Options;
}

export const atomCollectionOptions = atom<CollectionOptions>({
  key: 'collection/options',
  default: {},
  effects: []
});

export const selectorCollectionOptions = selectorFamily<Options, string>({
  key: 'collection/options/selector',
  get: (collectionName: string) => async ({ get }): Promise<Options> => {
    const collectionOptions = get(atomCollectionOptions);
    const { [collectionName]: val } = collectionOptions;
    if (val instanceof DefaultValue || isNil(val)) {
      return {};
    }
    return val;
  },
  set: (collectionName: string) => ({ get, set }, value) => {
    const collectionOptions = get(atomCollectionOptions);
    const { [collectionName]: val, ...next } = collectionOptions;
    if (value instanceof DefaultValue || isNil(value)) {
    } else {
      Object.assign(next, { [collectionName]: value });
    }
    set(
      atomCollectionOptions,
      next
    );
  }
});

export const atomCollectionQueries = atom<CollectionQueryStore>({
  key: 'collection/queries',
  default: {},
  effects: []
});

export const selectorCollectionQueries = selectorFamily<CollectionQueries, string>({
  key: 'collection/queries',
  get: (collectionName: string) => async ({ get }): Promise<CollectionQueries> => {
    const collectionQueries = get(atomCollectionQueries);
    const { [collectionName]: val } = collectionQueries;
    if (val instanceof DefaultValue || isNil(val)) {
      return {};
    }
    return val;
  },
  set: (collectionName: string) => ({ get, set }, value) => {
    const collectionQueries = get(atomCollectionQueries);
    const { [collectionName]: val, ...next } = collectionQueries;
    if (value instanceof DefaultValue || isNil(value)) {
    } else {
      Object.assign(next, { [collectionName]: value });
    }
    set(
      atomCollectionQueries,
      next
    );
  }
});

export const selectorCollectionQuery = selectorFamily<CollectionQuery, [string, string]>({
  key: 'collection/query',
  get: ([collectionName, queryName]: [string, string]) => async ({ get }): Promise<CollectionQuery> => {
    const collectionQueries = get(selectorCollectionQueries(collectionName));
    const { [queryName]: val } = collectionQueries;
    if (val instanceof DefaultValue || isNil(val)) {
      return { criteria: {}, index: [] };
    }
    return val;
  },
  set: ([collectionName, queryName]: [string, string]) => ({ get, set }, value) => {
    const collectionQueries = get(selectorCollectionQueries(collectionName));
    const { [queryName]: val, ...next } = collectionQueries;
    if (value instanceof DefaultValue || isNil(value)) {
    } else {
      Object.assign(next, { [queryName]: value });
    }
    set(
      selectorCollectionQueries(collectionName),
      next
    );
  }
});

interface UseCollectionProps {
  collectionName: string;
}

export const useCollectionOptions = ({ collectionName }: UseCollectionProps) =>
  useRecoilState<Options>(selectorCollectionOptions(collectionName));

interface UseCollectionQueryProps extends UseCollectionProps {
  queryName: string;
}

export const useCollectionQuery = ({ collectionName, queryName }: UseCollectionQueryProps) =>
  useRecoilState(selectorCollectionQuery([collectionName, queryName]));

export const useCollectionLocalQuery = ({ collectionName, queryName }: UseCollectionQueryProps) => {
  const options = useRecoilValue<Options>(selectorCollectionOptions(collectionName));
  const [{ criteria, index }, setQuery] = useCollectionQuery({ collectionName, queryName });
  const query = useMemo(
    () => new Query(criteria, options),
    [criteria, options]
  );

  const { records, version } = useRecoilValue(selectorCollection(collectionName));

  const makeIterator = useCallback(
    (start = 0) => {
      const keys = Object.keys(records);
      let nextIndex = start;
      return {
        next() {
          const result: { value?: Document; done: boolean; } = { done: true };
          for (let i = nextIndex; i < keys.length; i++) {
            const documentKey = keys[nextIndex];
            const document = records[Number(documentKey)];
            if (document && query.test(document))
              nextIndex = i + 1;
            Object.assign(result, { value: document, done: false });
            break;
          }
          return result;
        }
      };
    },
    [records, version]
  );

  const setCriteria = (value: RawObject) => {
    setQuery({ criteria: value, index });
  };

  return {
    index,
    query,
    makeIterator,
    setCriteria,
  };
};
