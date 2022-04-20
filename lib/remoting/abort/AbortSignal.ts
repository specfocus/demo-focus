import { EventEmitter } from 'events';

// `AbortSignal`,`AbortController` are defined here to prevent a dependency on the `dom` library which disagrees with node runtime.
// The definition for `AbortSignal` is taken from @types/node-fetch (https://github.com/DefinitelyTyped/DefinitelyTyped) for
// maximal compatibility with node-fetch.
// Original node-fetch definitions are under MIT License.

export class AbortSignal {
  readonly eventEmitter: EventEmitter = new EventEmitter();
  public aborted: boolean = false;
  public onabort: null | ((this: AbortSignal, event: any) => void) = null;

  get [Symbol.toStringTag]() {
    return 'AbortSignal';
  }

  addEventListener = (
    type: 'abort',
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
        capture?: boolean;
        once?: boolean;
        passive?: boolean;
      }
  ): void => {
    this.eventEmitter.on(type, listener);
  };

  removeEventListener = (
    type: 'abort',
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
        capture?: boolean;
      }
  ): void => {
    this.eventEmitter.removeListener(type, listener);
  };

  dispatchEvent = (type: 'abort'): boolean => {
    const event = { type, target: this };
    const handlerName = `on${type}` as keyof AbortSignal;

    switch (handlerName) {
      case 'onabort':
        if (typeof this.onabort === 'function') {
          this.onabort(event);
        }
        this.aborted = true;
        break;
      default:
        const { [handlerName]: handler } = this;
        if (typeof handler === 'function') {
        }
        break;
    }

    this.eventEmitter.emit(type, event);

    return true;
  };

  toString() {
    return '[object AbortSignal]';
  }
}

export default AbortSignal;
