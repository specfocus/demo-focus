import { SomeAction } from '@specfocus/main-focus/src/specs/action';

export interface ActionQueue {
  enqueue: (...actions: SomeAction[]) => void;
}

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
export interface Consumer extends AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  accepts: (type: SomeAction['type']) => boolean;
  enqueue: (...actions: SomeAction[]) => void | PromiseLike<void>;
};