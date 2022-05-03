import Multiplexer from '@lib/main/async/multiplexer';
import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Actor } from '../action/middleware/actor';
import MongoContext from './context';
import * as generators from './reactions';

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
class MongoMultiplexer extends Multiplexer<SomeAction> implements Actor {
  static create() {
    const context = new MongoContext();
    const reactors = Object.entries(generators)
      .reduce(
        (acc, [key, fn]) => Object.assign(
          acc,
          { [key]: fn.bind(context) }
        ),
        { ...generators }
      );
    return new MongoMultiplexer(context, reactors);
  }

  constructor(
    public readonly context: MongoContext,
    public readonly reactors:  typeof generators
  ) {
    // TODO use abort controller
    super([/* TODO add initial iterator to keep it alive */]);
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
      this.sources.push(asyncIterable);
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

export default MongoMultiplexer;
