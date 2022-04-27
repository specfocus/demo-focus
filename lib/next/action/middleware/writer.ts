import { ErrorToken } from '@specfocus/json-focus/stream/input/tokenizer';
import { PatchAction, SomeAction, ThrowAction } from '@specfocus/main-focus/src/specs/action';

// not used deprecated
export default class ResponseBroker {
  lineCount = 0;
  constructor(
    public controller: ReadableStreamController<Uint8Array>,
    public type: 'array' | 'shape' | 'value' = 'value'
  ) {
  }

  /** log sink */
  private send(action: SomeAction) {
    this.controller.enqueue(Buffer.from(JSON.stringify(action)));
    switch (action.type) {
      case 'error':
        break;
      default:
        break;
    }
    // TODO: handle error, create an alert
    switch (this.type) {
      case 'array':
        if (this.lineCount > 0) {
          this.controller.enqueue(Buffer.from(',\n'));
        } else {
          this.controller.enqueue(Buffer.from('\n'));
        }
        this.controller.enqueue(Buffer.from(JSON.stringify(action)));
        break;
      case 'shape':
        if (this.lineCount > 0) {
          this.controller.enqueue(Buffer.from(`,\n\t"${Date.now()}": `));
        } else {
          this.controller.enqueue(Buffer.from(`\n\t"${Date.now()}": `));
        }
        this.controller.enqueue(Buffer.from(JSON.stringify(action)));
        break;
      default:
        break;
    }
  }

  /** spawn process, execute function/business rule */
  error(token: ErrorToken) {
    if (this.type === 'value') {
      this.controller.enqueue(Buffer.from(token.message));
    } else {
      this.send({ type: 'alert', what: { type: 'fail', why: token.message }, when: Date.now() });
    }
    this.controller.close();
  }

  /** mutation */
  patch(what: PatchAction) {
    this.send(what);
  }

  /** fatal error */
  throw(what: ThrowAction) {
    this.send(what);
    this.controller.close();
  }
}