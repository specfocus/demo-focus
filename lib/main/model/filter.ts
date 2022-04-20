import { Shape, Value } from './shape';

export type Range<V extends number | string> = Partial<{
  [K in 'lt' | 'lte']: V;
}> & Partial<{
  [K in 'gt' | 'gte']: V;
}>

type Expression<T> = T extends number | string ? T | Range<T> : T extends {} ? Filter<T> : T;

export type Filter<S extends Shape> = Partial<{
  [K in keyof S]: Expression<S[K]>;
}>;

type A = Expression<{ a?: number; c: string}>;
type B = Expression<number[]>;
type C = Expression<boolean>;

const a: A = { a: 343 };
const b: B = [];
const c: C = false;

const f: Filter<{ n: number; s: string; }> = {
  n: { lt: 120, gte: 2000 }
}