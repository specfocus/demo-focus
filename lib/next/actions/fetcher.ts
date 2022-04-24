/// <reference lib="dom" />
import { Dispatch } from 'react';
import Tokenizer from '@specfocus/json-focus/stream/input/tokenizer';
import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import isAction from './isAction';

export default class Fetcher {
  constructor(
    private dispatch: Dispatch<SomeAction>
  ) {
    this.fetch = this.fetch.bind(this);
  }

  public fetch(
    input: RequestInfo,
    init?: RequestInit
  ): Promise<void> {
    return fetch(input, init).then(this.handler);
  }

  private async handler(
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