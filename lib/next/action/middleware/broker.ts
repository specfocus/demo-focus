import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Consumer } from './consumer';

export interface Broker extends AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  append: (consumer: Consumer) => void;
  cancel: (reason?: any) => void | PromiseLike<void>;
  enqueue: (...actions: SomeAction[]) => void;
}
