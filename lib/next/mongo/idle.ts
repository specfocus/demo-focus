import { SomeAction } from '@specfocus/main-focus/src/specs/action';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function* generator(controller: AbortController): AsyncGenerator<SomeAction> {
  while (!controller.signal.aborted) {
    await sleep(500);
    yield { type: 'async', what: { }, when: Date.now() + 500 };
  }
}

export default generator;
