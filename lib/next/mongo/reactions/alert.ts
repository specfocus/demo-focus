import { AlertAction, SomeAction } from '@specfocus/main-focus/src/specs/action';
import Context from '../context';

async function* generator(this: Context, { what }: Omit<AlertAction, 'type'>): AsyncGenerator<SomeAction> {
  throw new Error('Method not implemented.');
}

export default generator;
