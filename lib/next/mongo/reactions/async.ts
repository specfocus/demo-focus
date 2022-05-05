import { AsyncAction, SomeAction } from '@specfocus/main-focus/src/specs/action';
import Context from '../context/client';

async function* generator(this: Context, { what }: Omit<AsyncAction, 'type'>, controller: AbortController): AsyncGenerator<SomeAction> {
  throw new Error('Method not implemented.');
}

export default generator;
