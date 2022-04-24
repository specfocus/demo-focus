import Tokenizer, { EntryToken, ItemToken, ValueToken } from '@specfocus/json-focus/src/stream/input/tokenizer';
import { Broker } from '@specfocus/main-focus/src/specs/broker';
import isAction from './isAction';
import ResponseBroker from './response';

export default class Redux implements UnderlyingSource<Uint8Array> {
  constructor(
    public reader: ReadableStreamReader<Uint8Array>,
    public broker: Broker,
    /* public holder: Stakeholder */ // like a context with business logic
  ) {
  }

  get type(): undefined { return; }

  cancel(reason?: any): void | PromiseLike<void> {
    // TODO: listen to cancellation
    console.log('CANCEL!!!');
  }

  onEntry(res: ResponseBroker, token: EntryToken) {
    if (!isAction(token.value)) {
      return;
    }
    switch (token.value.type) {
      case 'alert':
        break;
      case 'patch':
        break;
    }

    // TODO hanlde token
    const response = Buffer.from([]);
    // Get the data and send it to the browser via the controller
    res.controller.enqueue(response);
  }

  onItem(res: ResponseBroker, token: ItemToken) {
    // TODO hanlde token
    const response = Buffer.from(JSON.stringify(token));
    // Get the data and send it to the browser via the controller
    res.controller.enqueue(response);
    res.controller.enqueue(Buffer.from(','));
  }

  onValue(res: ResponseBroker, token: ValueToken) {
    // TODO hanlde token
    const response = Buffer.from(JSON.stringify(token.value));
    // Get the data and send it to the browser via the controller
    res.controller.enqueue(response);
  }

  /*
  pull(controller: ReadableStreamController<Uint8Array>): void | PromiseLike<void> {
  }
  */

  start(controller: ReadableStreamController<Uint8Array>): any {
    const tokenizer = new Tokenizer();
    const response = new ResponseBroker(controller);
    // The following function handles each data chunk
    const push = () => {
      // The `read()` method returns a promise that
      // resolves when a value has been received.
      this.reader.read().then(({ done, value }) => {
        // Result objects contain two properties:
        // `done`  - `true` if the stream has already given you all its data.
        // `value` - Some data. Always `undefined` when `done` is `true`.
        if (value) {
          const tokens = tokenizer.tokenize(value);
          for (const token of tokens) {
            switch (token.type) {
              case 'array':
                response.type = 'array';
                controller.enqueue(Buffer.from('['));
                break;
              case 'entry':
                this.onEntry(response, token);
                break;
              case 'error':
                response.error(token);
                return;
              case 'item':
                this.onItem(response, token);
                break;
              case 'shape':
                response.type = 'shape';
                controller.enqueue(Buffer.from('{'));
                break;
              case 'value':
                this.onValue(response, token);
                break;
            }
          }
        }

        // If there is no more data to read
        if (done) {
          if (tokenizer.string && tokenizer.string.length) {
            const value = Number(tokenizer.string);
            if (!Number.isNaN(value)) {
              this.onValue(response, { type: 'value', value });
            }
          }
          // TODO: not true, we might still need to return more stuff
          switch (response.type) {
            case 'array':
              controller.enqueue(Buffer.from('\n]'));
              break;
            case 'shape':
              controller.enqueue(Buffer.from('\n}'));
              break;
          }
          controller.close();
          return;
        }
        push();
      });
    };
    push();
  }
}
