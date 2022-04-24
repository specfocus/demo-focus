import { AlertWhat } from '@specfocus/main-focus/src/specs/alert';
import { atom } from 'recoil';

export const atomAlert = atom<Record<number, AlertWhat>>({
  key: 'alert',
  default: {},
  effects: []
});

export const useAlert = () => {

};