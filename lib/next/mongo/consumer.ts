import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Actor } from '../action/middleware/actor';

/**                                                action consumer
 *  | request -> middleware -> broker (split) -> [ queue | iterator ] -> output => middleware -> response |
*/
const consumer = () => {

};

class MongoConsumer implements Actor, AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  private readonly _types = new Set<SomeAction['type']>(
    ['alert', 'patch', 'query']
  );

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<SomeAction> => this;

  public readonly accepts = (type: SomeAction['type']): boolean => this._types.has(type);

  public readonly abort = (reason?: any): void | PromiseLike<void> => {
    throw new Error('Method not implemented.');
  }

  public readonly consume = async (...actions: SomeAction[]): Promise<void> => {
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
