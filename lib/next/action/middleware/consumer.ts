import { SomeAction } from '@specfocus/main-focus/src/specs/action';

export interface ActionQueue {
  enqueue: (...actions: SomeAction[]) => void;
}

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
export interface Consumer {
  accepts: Set<SomeAction['type']>;
  input: ActionQueue;
  output: AsyncIterator<SomeAction>;
};