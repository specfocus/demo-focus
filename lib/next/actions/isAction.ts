import { SomeAction } from '@specfocus/main-focus/src/specs/action';

const isShape = (val: unknown): val is Record<string, any> =>
  typeof val === 'object' && val !== null && !Array.isArray(val);

const isAction = (val: unknown): val is SomeAction =>
  isShape(val) && typeof val.type === 'string';

export default isAction;
