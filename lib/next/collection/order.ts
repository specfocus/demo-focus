import { atom } from 'recoil';
import { CollectionOrder } from '@lib/main/collection/order';

export const atomOrder = atom<CollectionOrder>({
  key: 'collection/order',
  default: {},
  effects: []
});

export const useOrder = () => {

};