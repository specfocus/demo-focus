/// <reference lib="dom" />
import { Dispatch } from 'react';
import Tokenizer from '@specfocus/json-focus/stream/input/tokenizer';
import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import isAction from '../isAction';
import { Source } from './source';

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
      const tokenizer = new Tokenizer();
      let result: ReadableStreamDefaultReadResult<Uint8Array>;
      while (!(result = await reader.read()).done) {
        for (const token of tokenizer.tokenize(result.value)) {
          switch (token.type) {
            case 'array':
              break;
            case 'entry':
              if (isAction(token.value)) {
                this.dispatch(token.value);
              }
              break;
            case 'item':
              if (isAction(token.value)) {
                this.dispatch(token.value);
              }
              break;
            case 'shape':
              break;
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
