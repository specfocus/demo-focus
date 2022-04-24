import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Reducer } from 'react';
import { useRecoilState } from 'recoil';
import { atomStore, selectorCollection } from '../collection/store';

const reducer: Reducer<number, SomeAction> = (version: number, action: SomeAction): any => {
  const [store, update] = useRecoilState(atomStore);
  switch (action.type) {
    case 'alert':
      break;
    case 'patch':
      for (const [collectionName, records] of Object.entries(action.what)) {
        let { [collectionName]: collection } = store;
        if (!collection) {
          collection = { records: {}, version: -1 };
        }
        update({
          ...store,
          [collectionName]: {
            records: Object.assign(collection.records, records),
            version: collection.version + 1
          }
        });
      }
      version++;
      break;
    default:
      console.log(`unsuported action "${action.type}"`);
      break;
  }
  return version;
};

export default reducer;