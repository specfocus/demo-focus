import { NO_ROOT_ARRAY, Tokenizer } from '@specfocus/json-focus/async/tokenizer';
import isAction from '../isAction';
import { Broker } from './broker';
/**
 * Used in 
 */
class RequestSink implements UnderlyingSink<Uint8Array> {
  private readonly tokenizer: Tokenizer;
  type?: undefined;

  constructor(public readonly broker: Broker) {
    this.tokenizer = new Tokenizer(new Set([NO_ROOT_ARRAY]));
  }

  abort = (reason?: any): void | PromiseLike<void> => { };

  // close = (): void | PromiseLike<void> => { };
  // start = (controller: WritableStreamDefaultController): any => { };
  write = (chunk: Uint8Array, controller: WritableStreamDefaultController): void | PromiseLike<void> => {
    const tokens = this.tokenizer.tokenize(chunk);
    for (const token of tokens) {
      if (token.type === 'error') {
        controller.error(token);
        break;
      }
      if (!isAction(token.value)) {
        continue;
      }
      this.broker.enqueue(token.value);
    }
  };
}

export default RequestSink;
