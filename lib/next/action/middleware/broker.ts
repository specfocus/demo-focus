import { SomeAction } from '@specfocus/main-focus/src/specs/action';
import { Consumer } from './consumer';

export interface Broker extends AsyncIterable<SomeAction>, AsyncIterator<SomeAction> {
  cancel: (reason?: any) => void | PromiseLike<void>;
  enqueue: (...actions: SomeAction[]) => void;
}

interface Entry<T = any> {
  key: AsyncGenerator<T>;
  it: AsyncIterator<T>;
  result?: T | null;
}

const merge = async function* <T = any>(...gens: AsyncGenerator<T>[]) {
  // Worker function to queue up the next result
  const queueNext = async (e: Entry) => {
    e.result = null; // Release previous one as soon as possible
    e.result = await e.it.next();
    return e;
  };
  // Map the generators to source objects in a map, get and start their
  // first iteration
  const sources = new Map(gens.map(gen => [
    gen,
    queueNext({
      key: gen,
      it: gen[Symbol.asyncIterator]()
    })
  ]));
  // While we still have any sources, race the current promise of
  // the sources we have left
  while (sources.size) {
    const winner = await Promise.race(sources.values());
    // Completed the sequence?
    if (winner.result.done) {
      // Yes, drop it from sources
      sources.delete(winner.key);
    } else {
      // No, grab the value to yield and queue up the next
      // Then yield the value
      const { value } = winner.result;
      sources.set(winner.key, queueNext(winner));
      yield value;
    }
  }
};

export default merge;
