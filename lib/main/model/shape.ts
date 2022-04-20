export type Value = boolean | number | string;

export type Shape<nullable extends boolean = false> = Record<string, nullable extends true ? Value | null | undefined : Value>;

interface ComplexField {
  // The complex field is an array of
  item?: 'boolean' | 'integer' | 'moment' | 'number' | 'object' | 'string' | 'timestamp';
  
  // if item is 'object' this is the shape of the items in the array
  // or the shape of the item itself
  shape?: Fieldset<Shape>;
  type: 'object';
}

interface ValueField<T extends Value> {
  optional?: true | T; // T is default value
}

interface BooleanField {
  type: 'boolean';
}

interface IntegerField extends ValueField<number> {
  type: 'integer' | 'timestamp';
}

interface NumericField extends ValueField<number> {
  type: 'integer' | 'number' | 'timestamp';
}

interface StringField extends ValueField<string> {
  type: 'moment' | 'string';
}

type FieldOf<T> =
  T extends boolean ? BooleanField :
  T extends BigInt ? IntegerField :
  T extends number ? NumericField :
  T extends string ? StringField : ComplexField;

export type ComplexShape = Record<string, Value | object>;

export type Fieldset<S extends ComplexShape> = {
  [K in keyof S]: FieldOf<S[K]>
};

export const simplify = <S extends Shape>(fields: Fieldset<S>): Fieldset<S> => Object.entries(fields).reduce(
  (acc, [key, val]) => val.type !== 'object' ? Object.assign({ [key]: val }) : acc,
  {} as Fieldset<S>
);