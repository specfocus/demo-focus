import { AlertAction, AsyncAction, PatchAction, QueryAction, QuickAction, SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Broker } from './broker';
import { Consumer } from './consumer';

async function* alert(): AsyncIterable<AlertAction> {

}

async function* patch(): AsyncIterable<AlertAction | PatchAction> {

}

/** 
 * 
 */
class RequestBroker implements Broker, AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  constructor() {
  }

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<SomeAction> => this;

  public readonly add = (consumer: Consumer): void => {
    throw new Error('Method not implemented.');
  };

  public readonly cancel = async (reason?: any): Promise<void> => {
    throw new Error('Method not implemented.');
  }

  /** AsyncIterator<SomeAction> */
  public readonly next = (...args: [] | [undefined]): Promise<IteratorResult<SomeAction, SomeAction>> => {
    throw new Error('Method not implemented.');
  };

  public readonly push = (...actions: SomeAction[]): void => {
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


  /** log sink */
  async alert(what: AlertAction): Promise<void> {
  };

  /** spawn process, execute function/business rule */
  async(what: AsyncAction): AsyncIterable<AlertAction> {
    return alert();
  };

  /** execute business rule, in the call */
  await(what: QuickAction): AsyncIterable<AlertAction> {
    return alert();
  };

  // https://medium.com/fasal-engineering/fetching-data-from-different-collections-via-mongodb-aggregation-operations-with-examples-a273f24bfff0
  query(what: QueryAction): AsyncIterable<AlertAction | PatchAction> {
    return patch();
  };

  /** mutation */
  patch(what: PatchAction): AsyncIterable<AlertAction> {
    return alert();
  };
  /** fatal error
  async throw(what: ThrowAction): Promise<AlertAction> {
    return { type: 'alert', what: { type: 'done', what: 1 }, when: Date.now() };
  }
  */
}

export default RequestBroker;
