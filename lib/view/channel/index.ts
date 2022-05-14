/// <reference lib="dom" />
import { Dispatch } from 'react';
import { NO_ROOT_ARRAY, Tokenizer } from '@specfocus/json-focus/async/tokenizer';
import { SomeAction } from '@specfocus/main-focus/actions';
import isAction from '@specfocus/main-focus/actions/isAction';
import { Source } from './source';
import { type } from 'os';

/** UI */
export class Channel {
  private source: Source = new Source();

  constructor(
    public url: string,
    public dispatch: Dispatch<SomeAction>,
    public method: 'POST' = 'POST'
  ) {
    this.source = new Source();
    this.connect = this.connect.bind(this);
    this.enqueue = this.enqueue.bind(this);
    this.send = this.send.bind(this);
    this._handler = this._handler.bind(this);
  }

  public get connected() {
    return this.source.connected;
  }

  public get queue() {
    return this.source.queue;
  }

  public connect(): AbortController {
    const method = this.method;
    const controller = new AbortController();
    const signal = controller.signal;
    const body = new ReadableStream(this.source);
    fetch(this.url, { body, method, signal })
      .then(this._handler)
      .catch(e => {
        console.log(e.message);
      })
      .finally(() => {
        console.log('disconnected');
      });
    return controller;
  }

  public enqueue(action: SomeAction) {
    this.queue.push(action);
  }

  public send(action: SomeAction) {
    this.enqueue(action);
    if (!this.connected) {
      this.connect();
    }
  }

  private async _handler(
    res: Response
  ): Promise<void> {
    if (!res.ok || !res.body || res.bodyUsed) {
      return;
    }
    const reader = res.body.getReader();
    try {
      const tokenizer = new Tokenizer(new Set([NO_ROOT_ARRAY]));
      let result: ReadableStreamDefaultReadResult<Uint8Array>;
      while (!(result = await reader.read()).done) {
        for (const token of tokenizer.tokenize(result.value)) {
          if (token.type === 'error') {
          } else if (token.path.length > 1) {
            throw new Error(`this shouldn't happen`);
          } else if (token.path.length === 1) {
            if (isAction(token.value)) {
              this.dispatch(token.value);
            }
          } else /* token.path.length === 0 */ {
            if (token.type === 'array') {
              throw new Error(`this shouldn't happen`);
            }
            throw new Error(`this shouldn't happen`);
          }
        }
      }
      if (tokenizer.string && tokenizer.string.length) {
        const value = Number(tokenizer.string);
        if (!Number.isNaN(value)) {
          // this.onValue(response, { type: 'value', value });
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
