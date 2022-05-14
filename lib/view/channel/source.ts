import { SomeAction } from '@specfocus/main-focus/actions';

/** UI */
export class Source implements UnderlyingSource<Uint8Array> {
  connected: boolean = false;

  constructor(
    public queue: SomeAction[] = []
  ) {
  }

  get type(): undefined { return; }

  cancel(reason?: any): void | PromiseLike<void> {
    this.connected = false;
  }

  pull(controller: ReadableStreamController<Uint8Array>): void | PromiseLike<void> {
    this.connected = true;
  }

  start(controller: ReadableStreamController<Uint8Array>): any {
    this.connected = true;
  }
}
