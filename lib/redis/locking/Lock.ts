import { ExecutionResult, ExecutionStats } from './execution';
import Redlock from './Redlock';

/*
 * An object of this type is returned when a resource is successfully locked. It
 * contains convenience methods `release` and `extend` which perform the
 * associated Redlock method on itself.
 */
export class Lock {
  constructor(
    public readonly redlock: Redlock,
    public readonly resources: string[],
    public readonly value: string,
    public readonly attempts: ReadonlyArray<Promise<ExecutionStats>>,
    public expiration: number
  ) {}

  async release(): Promise<ExecutionResult> {
    return this.redlock.release(this);
  }

  async extend(duration: number): Promise<Lock> {
    return this.redlock.extend(this, duration);
  }
}

export default Lock;
