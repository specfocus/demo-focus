import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { ActionQueue, Consumer } from '../action/middleware/consumer';

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
const consumer = () => {

};

class MongoConsumer implements Consumer, AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  private readonly _types = new Set<SomeAction['type']>(
    ['alert', 'patch', 'query']
  );

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<SomeAction> => this;

  public readonly accepts = (type: SomeAction['type']): boolean => this._types.has(type);

  public readonly enqueue = async (...actions: SomeAction[]): Promise<void> => {
    throw new Error('Method not implemented.');
  }

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
