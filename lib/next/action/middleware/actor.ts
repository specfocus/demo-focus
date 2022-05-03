import { SomeAction } from '@specfocus/main-focus/src/specs/action';

export interface Reactor extends AsyncIterable<SomeAction> {
  abort: (reason?: any) => void | PromiseLike<void>;
}
/**                               action consumer
 *  | request -> middleware -> [ enqueue | iterator ] -> output => middleware -> response |
 */
export interface Actor extends Reactor {
  consume: (...actions: SomeAction[]) => void | PromiseLike<void>;
};