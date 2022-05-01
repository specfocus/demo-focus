import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Consumer } from './consumer';

export interface Broker extends AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  add: (consumer: Consumer) => void;
  cancel: (reason?: any) => void | PromiseLike<void>;
  push: (...actions: SomeAction[]) => void;
}
