import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import merge from '../../../main/async/merge';
import { Actor } from './actor';

/** 
 * shares actions with consumers and merge reactions
 */
class RequestBroker implements Actor {
  private readonly _reactions: AsyncGenerator<SomeAction>;
  private readonly _consumers: Actor[];

  constructor(...actors: Actor[]) {
    this._consumers = actors;
    this._reactions = merge<SomeAction>(...actors);
  }

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<SomeAction> => this._reactions;

  public readonly accepts = (type: SomeAction['type']): boolean => true;

  public readonly abort = async (reason?: any): Promise<void> => {
    for (const consumer of this._consumers) {
      await Promise.resolve(consumer.abort());
    }
  };

  public readonly consume = async (...actions: SomeAction[]): Promise<void> => {
    for (const consumer of this._consumers) {
      await Promise.resolve(consumer.consume(...actions));
    }
  };
}

export default RequestBroker;
