import { PatchAction, SomeAction } from '@specfocus/main-focus/src/specs/action';
import Context from '../context';

async function* generator(this: Context, { what }: Omit<PatchAction, 'type'>, controller: AbortController): AsyncGenerator<SomeAction> {
  throw new Error('Method not implemented.');
}

export default generator;
