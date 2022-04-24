import Tokenizer, { Token } from '@specfocus/json-focus/stream/input/tokenizer';
import type { NextRequest } from 'next/server';
import iterable from '../stream/asyc-generator';

export default async function* tokenize(req: NextRequest): AsyncIterable<Token> {
  if (req.body === null) {
    return;
  }
  const tokenizer = new Tokenizer();
  const reader = req.body.getReader();
  for await (const chunk of iterable(reader)) {
    if (chunk) {
      const tokens = tokenizer.tokenize(chunk);
      for (const token of tokens) {
        if (token.type === 'error') {
          return token;
        }
        yield token;
      }
    }
  }

  if (tokenizer.string && tokenizer.string.length) {
    const value = Number(tokenizer.string);
    if (!Number.isNaN(value)) {
      yield { type: 'value', value };
    }
  }
}
