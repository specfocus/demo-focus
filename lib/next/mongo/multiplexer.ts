import Multiplexer from '@lib/main/async/multiplexer';
import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Actor } from '../action/middleware/actor';
import MongoContext from './context';
import * as generators from './reactions';
import idle from './idle';

/** Mongo actor receiving actions from request-multiplexer in the middleware
 *  | request-sink -> midleware-mutiplexer -> mongo-multiplexer -> request-source |
 */
class MongoMultiplexer extends Multiplexer<SomeAction> implements Actor {
  static create(controller: AbortController) {
    const context = MongoContext.create();
    const reactors = Object.entries(generators)
      .reduce(
        (acc, [key, fn]) => Object.assign(
          acc,
          { [key]: fn.bind(context) }
        ),
        { ...generators }
      );
    return new MongoMultiplexer(controller, context, reactors);
  }

  constructor(
    public readonly controller: AbortController,
    public readonly context: MongoContext,
    public readonly reactors: typeof generators
  ) {
    // TODO use abort controller
    super([ idle(controller) ]);
  }

  public readonly abort = (reason?: any): void | PromiseLike<void> => {
    throw new Error('Method not implemented.');
  };

  public readonly consume = async (...actions: SomeAction[]): Promise<void> => {
    for (const action of actions) {
      if (this.controller.signal.aborted) {
        break;
      }
      const { type, ...params } = action;
      const { [type]: fn } = this.reactors;
      // @ts-ignore
      const asyncIterable = fn(params, this.controller);
      this.sources.push(asyncIterable);
    }
  };
}

export default MongoMultiplexer;
