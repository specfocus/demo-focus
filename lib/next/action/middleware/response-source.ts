import { Broker } from './broker';

/** API */
export default class ResponseSource implements UnderlyingSource<Uint8Array> {
  count = 0;

  constructor(
    public readonly broker: Broker,
  ) {
  }

  get type(): undefined { return; }

  public readonly cancel = (reason?: any): void | PromiseLike<void> => this.broker.cancel(reason);

  public readonly pull = async (controller: ReadableStreamController<Uint8Array>): Promise<void> => {
    const { done, value } = await this.broker.next();
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
