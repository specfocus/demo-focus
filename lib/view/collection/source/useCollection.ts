import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { selectorCollection } from './store';

export interface CollectionConfig {
  collectionName: string;
}
const useCollection = <K extends number | string = number>(
  { collectionName }: CollectionConfig
) => {
  const [{ records, version }, update] = useRecoilState(selectorCollection(collectionName));

  const append = useCallback(
    async () => {
      return;
    },
    []
  );

  const detail = useCallback(
    async (key: K) => {
      return;
    },
    []
  );

  const inventory = useCallback(
    async () => {
      return;
    },
    []
  );

  const patch = useCallback(
    async (key: K) => {
      return;
    },
    []
  );

  const remove = useCallback(
    async (key: K) => {
      return;
    },
    []
  );

  const replace = useCallback(
    async (key: K) => {
      return;
    },
    []
  );

  return {
    append,
    detail,
    inventory,
    patch,
    remove,
    replace,
    records,
    version
  };
};

export default useCollection;