import { AbortSignal } from './AbortSignal';

// AbortController became available as a global in node version 16.
// Once version 14 reaches its end-of-life, this can be removed.
export class AbortController {
  readonly signal: AbortSignal = new AbortSignal();

  get [Symbol.toStringTag]() {
    return 'AbortController';
  }

  abort() {
    if (this.signal.aborted) return;
    this.signal.dispatchEvent('abort');
  }

  toString() {
    return '[object AbortController]';
  }
}

export default AbortController;
