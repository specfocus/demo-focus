interface Producer<T = any> {
  src: AsyncIterable<T>;
  it: AsyncIterator<T>;
  result?: T | null;
}

class Multiplexer<T> {
  constructor(
    protected readonly sources: AsyncIterable<T>[]
  ) {
  }

  public readonly [Symbol.asyncIterator] = (): AsyncIterator<T> => this.generator.bind(this.sources)();

  /**
   * Merges multiple async sources (iterators)
   * @param this async iterables or async generators
   */
  readonly generator = async function* (this: AsyncIterable<T>[]): AsyncGenerator<T> {
    // Worker function to queue up the next result
    const queueNext = async (p: Producer) => {
      p.result = null; // Release previous one as soon as possible
      p.result = await p.it.next();
      return p;
    };
    // Map the generators to source objects in a map, get and start their
    // first iteration
    const producers = new Map(this.map(generator => [
      generator,
      queueNext({
        src: generator,
        it: generator[Symbol.asyncIterator]()
      })
    ]));
    // While we still have any sources, race the current promise of
    // the sources we have left
    while (producers.size) {
      const winner = await Promise.race(producers.values());
      // Completed the sequence?
      if (winner.result.done) {
        // Yes, drop it from sources
        producers.delete(winner.src);
      } else {
        // No, grab the value to yield and queue up the next
        // Then yield the value
        const { value } = winner.result;
        
        producers.set(winner.src, queueNext(winner));

        yield value;
      }
    }
  };
}

export default Multiplexer;
