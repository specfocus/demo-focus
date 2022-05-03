import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Actor } from '../action/middleware/actor';
import MongoContext from './context';
import * as generators from './reactions';

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
class MongoConsumer implements Actor {
  private readonly reactors: typeof generators;

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<SomeAction> => this;

  constructor() {
    const context = new MongoContext();
    this.reactors = Object.entries(generators)
      .reduce(
        (acc, [key, fn]) => Object.assign(
          acc,
          { [key]: fn.bind(context) }
        ),
        { ...generators }
      );
  }

  public readonly abort = (reason?: any): void | PromiseLike<void> => {
    throw new Error('Method not implemented.');
  };

  public readonly consume = async (...actions: SomeAction[]): Promise<void> => {
    for (const action of actions) {
      const { type, ...params } = action;
      const { [type]: fn } = this.reactors;
      // @ts-ignore
      const asyncIterable = fn(params);
      // merge that ^
    }
  };

  /** AsyncIterator<SomeAction> */
  public readonly next = (...args: [] | [undefined]): Promise<IteratorResult<SomeAction, SomeAction>> => {
    throw new Error('Method not implemented.');
  };

  /** AsyncIterator<SomeAction> */
  public readonly return = (value?: SomeAction | PromiseLike<SomeAction>): Promise<IteratorResult<SomeAction, SomeAction>> => {
    throw new Error('Method not implemented.');
  };

  /** AsyncIterator<SomeAction> */
  public readonly throw = (e?: any): Promise<IteratorResult<SomeAction, SomeAction>> => {
    throw new Error('Method not implemented.');
  };
}

export default MongoConsumer;
