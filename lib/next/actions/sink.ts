import { AlertAction, AsyncAction, PatchAction, QueryAction, QuickAction, ThrowAction } from '@specfocus/main-focus/src/specs/action';
import { Broker } from '@specfocus/main-focus/src/specs/broker';

async function* alert(): AsyncIterable<AlertAction> {

}

async function* patch(): AsyncIterable<AlertAction | PatchAction> {

}

export default class SinkBroker implements Broker {
  constructor(
    public controller: ReadableStreamController<Uint8Array>
  ) {
  }
  
  /** log sink */
  async alert(what: AlertAction): Promise<void> {
  }

  /** spawn process, execute function/business rule */
  async(what: AsyncAction): AsyncIterable<AlertAction> {
    return alert();
  }

  /** execute business rule, in the call */
  await(what: QuickAction): AsyncIterable<AlertAction> {
    return alert();
  }

  // https://medium.com/fasal-engineering/fetching-data-from-different-collections-via-mongodb-aggregation-operations-with-examples-a273f24bfff0
  query(what: QueryAction): AsyncIterable<AlertAction | PatchAction> {
    return patch();
  }
  
  /** mutation */
  patch(what: PatchAction): AsyncIterable<AlertAction> {
    return alert();
  }
  
  /** fatal error */
  async throw(what: ThrowAction): Promise<AlertAction> {
    return { type: 'alert', what: { type: 'done', what: 1 }, when: Date.now() };
  }
}