import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Reactor } from './actor';

/** API */
export default class ResponseSource implements UnderlyingSource<Uint8Array> {
  count = 0;
  private readonly _iterator: AsyncIterator<SomeAction>;

  constructor(
    public readonly source: Reactor
  ) {
    this._iterator = source[Symbol.asyncIterator]();
  }

  get type(): undefined { return; }

  public readonly cancel = (reason?: any): void | PromiseLike<void> => this.source.abort(reason);

  public readonly pull = async (controller: ReadableStreamController<Uint8Array>): Promise<void> => {
    const { done, value } = await this._iterator.next();
    if (value) {
      if (this.count > 0) {
        controller.enqueue(Buffer.from(','));
      }
      controller.enqueue(Buffer.from('\n'));
      controller.enqueue(Buffer.from(JSON.stringify(value)));
      this.count++;
    }
    if (done) {
      controller.enqueue(Buffer.from('\n]'));
      controller.close();
    }
  };

  public readonly start = (controller: ReadableStreamController<Uint8Array>): any => {
    this.count = 0;
    controller.enqueue(Buffer.from('['));
  };
}
