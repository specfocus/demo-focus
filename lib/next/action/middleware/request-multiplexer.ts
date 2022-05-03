import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import Multiplexer from '../../../main/async/multiplexer';
import { Actor } from './actor';

/** 
 * shares actions with consumers and merge reactions
 */
class RequestBroker extends Multiplexer<SomeAction> implements Actor{
  private readonly _consumers: Actor[];

  constructor(...actors: Actor[]) {
    super(actors);
    this._consumers = actors;
  }

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
