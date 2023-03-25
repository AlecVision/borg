import * as _ from "./types";
import { Double, ObjectId } from "bson";
import { BorgError } from "./errors";

const isin = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
  key in obj;

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB        OOOOOOOOOOOO     BBBBBBBBBBBBBBBBB          JJJJJJJJJJJJJJ  ///
///  B////////////////B     OO////////////OO   B////////////////B         J////////////J  ///
///  B/////////////////B   OO//////////////OO  B/////////////////B        J////////////J  ///
///  B//////BBBBBB//////B O///////OOO////////O BB/////BBBBBB//////B       JJJJJJ////JJJJ  ///
///  BB/////B     B/////B O//////O   O///////O   B////B     B/////B            J////J     ///
///    B////B     B/////B O/////O     O//////O   B////B     B/////B            J////J     ///
///    B////B     B/////B O/////O     O//////O   B////B     B/////B            J////J     ///
///    B////BBBBBB/////B  O/////O     O//////O   B////BBBBBB/////B             J////J     ///
///    B////////////BB    O/////O     O//////O   B/////////////BB     JJJJJJ   J////J     ///
///    B////BBBBBB/////B  O/////O     O//////O   B////BBBBBB/////B   J//////J  J////J     ///
///    B////B     B/////B O/////O     O//////O   B////B     B/////B J//////J   J////J     ///
///    B////B     B/////B O/////O     O//////O   B////B     B/////B J/////J    J////J     ///
///    B////B     B/////B O/////O     O//////O   B////B     B/////B J/////J    J////J     ///
///  BB/////BBBBBB//////B O///////OOO////////O BB/////BBBBBB//////B J//////JJJJ/////J     ///
///  B/////////////////B  OO///////////////OO  B/////////////////B   J//////////////J     ///
///  B////////////////B    OO/////////////OO   B////////////////B     J////////////J      ///
///  BBBBBBBBBBBBBBBBB       OOOOOOOOOOOOOO    BBBBBBBBBBBBBBBBB       JJJJJJJJJJJJ       ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgObject<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TShape extends { [key: string]: _.Borg } = {
    [key: string]: _.Borg;
  },
> extends _.Borg {
  #shape: TShape;
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  constructor(shape: TShape) {
    super();
    this.#shape = Object.freeze(
      Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [key, value.copy()]),
      ),
    ) as any;
  }

  static #clone<const TBorg extends B.Object<any, any>>(borg: TBorg): TBorg {
    const newShape = {} as { [key: string]: _.Borg };
    for (const key in borg.#shape) newShape[key] = borg.#shape[key]!.copy();
    const clone = new BorgObject(newShape);
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): _.ObjectMeta<TFlags, TShape> {
    return Object.freeze({
      kind: "object",
      shape: this.#shape,
      keys: Object.freeze(Object.keys(this.#shape)),
      requiredKeys: Object.freeze(
        Object.keys(this.#shape).filter(
          k => this.#shape[k]!.meta.optional === false,
        ),
      ),
      ...this.#flags,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgObject.#clone(this);
  }

  parse(
    input: unknown,
  ): _.Parsed<{ [k in keyof TShape]: B.Type<TShape[k]> }, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `OBJECT_ERROR: Expected object${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `OBJECT_ERROR: Expected object${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (typeof input !== "object") {
      throw new BorgError(
        `OBJECT_ERROR: Expected object,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
      );
    }
    if (Array.isArray(input)) {
      throw new BorgError(
        `OBJECT_ERROR: Expected object,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got array`,
      );
    }
    const result = {} as any;
    for (const key in this.#shape) {
      const schema = this.#shape[key];
      if (schema === undefined) {
        throw new BorgError(
          `OBJECT_ERROR: Invalid schema for key "${key}": got undefined`,
          undefined,
          [key],
        );
      }

      if (!isin(input, key)) {
        //TODO: implement 'exactOptional' by providing a config flag somewhere?
        if (this.#shape[key]!.meta.optional === false) {
          throw new BorgError(
            `OBJECT_ERROR: Missing property "${key}"`,
            undefined,
            [key],
          );
        }
        continue;
      }
      try {
        const parsed = this.#shape[key]!.parse(input[key]);
        result[key] = parsed;
        continue;
      } catch (e) {
        if (e instanceof BorgError) {
          throw new BorgError(
            `OBJECT_ERROR: Invalid value for property "${key}"`,
            e,
            [key],
          );
        } else {
          throw new BorgError(
            `OBJECT_ERROR: Unknown error parsing "${key}": \n\t${JSON.stringify(
              e,
            )}`,
            undefined,
            [key],
          );
        }
      }
    }
    return result;
  }

  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `OBJECT_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
    }
  }

  serialize(
    input: B.Type<this>,
  ): _.Sanitized<{ [k in keyof TShape]: B.Serialized<TShape[k]> }, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(
        "OBJECT_ERROR(serialize): Cannot serialize private schema",
      );
    }
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.#shape) {
      if (!isin(input, key)) continue;
      const schema = this.#shape[key];
      if (schema === undefined)
        throw new BorgError(
          `SCHEMA_ERROR(serialize): Invalid schema for key "${key}": got undefined`,
          undefined,
          [key],
        );
      if (schema.meta.private) continue;
      result[key] = schema.serialize(input[key]);
    }
    return result;
  }

  deserialize(
    input: B.Serialized<this>,
  ): _.Sanitized<{ [k in keyof TShape]: B.Deserialized<TShape[k]> }, TFlags> {
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.#shape) {
      if (!isin(input, key)) continue;
      const schema = this.#shape[key];
      if (schema === undefined) {
        throw new BorgError(
          `SCHEMA_ERROR(deserialize): Invalid schema for key "${key}": got undefined`,
          undefined,
          [key],
        );
      }
      result[key] = schema.deserialize(input[key]);
    }
    return result;
  }
  //TODO: Should we be treating 'undefined' in any special way when converting to BSON?
  toBson<const TInput extends Partial<B.Type<this>> = B.Type<this>>(
    input: TInput,
  ): {
    [k in keyof TShape as keyof TInput]: k extends keyof TInput
      ? TInput[k] extends undefined
        ? never
        : B.BsonType<TShape[k]>
      : never;
  } {
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.#shape) {
      if (!isin(input, key)) continue;
      const schema = this.#shape[key];
      if (schema === undefined) {
        throw new BorgError(
          `SCHEMA_ERROR(toBson): Invalid schema for key "${key}": got undefined`,
          undefined,
          [key],
        );
      }
      result[key] = schema.toBson(input[key]);
    }
    return result;
  }

  fromBson(input: B.BsonType<this>): B.Type<this> {
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.#shape) {
      if (!isin(input, key)) continue;
      const schema = this.#shape[key];
      if (schema === undefined) {
        throw new BorgError(
          `SCHEMA_ERROR(fromBson): Invalid schema for key "${key}": got undefined`,
          undefined,
          [key],
        );
      }
      result[key] = schema.fromBson(input[key]);
    }
    return result;
  }

  optional(): BorgObject<_.SetOptional<TFlags>, TShape> {
    const copy = this.copy();
    copy.#flags.optional = true;
    return copy as any;
  }

  nullable(): BorgObject<_.SetNullable<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgObject<_.SetNullish<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgObject<_.SetRequired<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgObject<_.SetNotNull<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgObject<_.SetNotNullish<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgObject<_.SetPrivate<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgObject<_.SetPublic<TFlags>, TShape> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }

  /* c8 ignore next */
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB          AAAAAAAA       RRRRRRRRRRRRRRRRR    RRRRRRRRRRRRRRRRR     ///
///  B////////////////B        A////////A      R////////////////R   R////////////////R    ///
///  B/////////////////B      A//////////A     R/////////////////R  R/////////////////R   ///
///  B//////BBBBBB//////B    A/////AA/////A    R//////RRRRRRR/////R R//////RRRRRRR/////R  ///
///  BB/////B     B/////B   A/////A  A/////A   RR/////R      R////R RR/////R      R////R  ///
///    B////B     B/////B  A/////A    A/////A    R////R      R////R   R////R      R////R  ///
///    B////B     B/////B A/////A      A/////A   R////R      R////R   R////R      R////R  ///
///    B////BBBBBB/////B  A/////A      A/////A   R////RRRRRRR////R    R////RRRRRRR////R   ///
///    B////////////BB    A/////AAAAAAAA/////A   R/////////////RR     R/////////////RR    ///
///    B////BBBBBB/////B  A//////////////////A   R////RRRRRRR////R    R////RRRRRRR////R   ///
///    B////B     B/////B A/////AAAAAAAA/////A   R////R      R////R   R////R      R////R  ///
///    B////B     B/////B A/////A      A/////A   R////R      R////R   R////R      R////R  ///
///    B////B     B/////B A/////A      A/////A   R////R      R////R   R////R      R////R  ///
///  BB/////BBBBBB//////B A/////A      A/////A RR/////R      R////R RR/////R      R////R  ///
///  B/////////////////B  A/////A      A/////A R//////R      R////R R//////R      R////R  ///
///  B////////////////B   A/////A      A/////A R//////R      R////R R//////R      R////R  ///
///  BBBBBBBBBBBBBBBBB    AAAAAAA      AAAAAAA RRRRRRRR      RRRRRR RRRRRRRR      RRRRRR  ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgArray<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TLength extends _.MinMax = [null, null],
  const TItemSchema extends _.Borg = _.Borg,
> extends _.Borg {
  #itemSchema: TItemSchema;
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #max: TLength[1] = null;
  #min: TLength[0] = null;

  constructor(itemSchema: TItemSchema) {
    super();
    this.#itemSchema = itemSchema.copy() as any;
  }

  static #clone<const TBorg extends B.Array<any, any, any>>(
    borg: TBorg,
  ): TBorg {
    const clone = new BorgArray(borg.#itemSchema.copy());
    clone.#flags = { ...borg.#flags };
    clone.#max = borg.#max;
    clone.#min = borg.#min;
    return clone as any;
  }

  get meta(): _.ArrayMeta<TFlags, TLength, TItemSchema> {
    return Object.freeze({
      kind: "array",
      maxItems: this.#max,
      minItems: this.#min,
      itemSchema: this.#itemSchema,
      ...this.#flags,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgArray.#clone(this);
  }

  parse(input: unknown): _.Parsed<Array<B.Type<TItemSchema>>, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `ARRAY_ERROR: Expected array${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `ARRAY_ERROR: Expected array${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (!Array.isArray(input)) {
      throw new BorgError(
        `ARRAY_ERROR: Expected array,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
      );
    }
    if (this.#min !== null && input.length < this.#min) {
      throw new BorgError(
        `ARRAY_ERROR: Expected array length to be greater than or equal to ${
          this.#min
        }, got ${input.length}`,
      );
    }
    if (this.#max !== null && input.length > this.#max) {
      throw new BorgError(
        `ARRAY_ERROR: Expected array length to be less than or equal to ${
          this.#max
        }, got ${input.length}`,
      );
    }
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      try {
        const parsed = this.#itemSchema.parse(input[i]);
        result[i] = parsed;
        continue;
      } catch (e) {
        if (e instanceof BorgError) {
          throw new BorgError(`ARRAY_ERROR: ${e.message} at index ${i}`, e, [
            i,
          ]);
        } else {
          throw new BorgError(
            `ARRAY_ERROR: Unknown error parsing index "${i}": \n\t${JSON.stringify(
              e,
            )}`,
            undefined,
            [i],
          );
        }
      }
    }
    return result;
  }

  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `ARRAY_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
    }
  }

  serialize(
    input: B.Type<this>,
  ): _.Sanitized<Array<B.Serialized<TItemSchema>>, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(
        "ARRAY_ERROR(serialize): Cannot serialize private schema",
      );
    }
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.#itemSchema.serialize(input[i]);
    }
    return result;
  }

  deserialize(
    input: B.Serialized<this>,
  ): _.Sanitized<Array<B.Deserialized<TItemSchema>>, TFlags> {
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.#itemSchema.deserialize(input[i]);
    }
    return result;
  }

  toBson(input: B.Type<this>): Array<B.BsonType<TItemSchema>> {
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.#itemSchema.toBson(input[i]);
    }
    return result;
  }

  fromBson(input: B.BsonType<this>): B.Type<this> {
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.#itemSchema.fromBson(input[i]);
    }
    return result;
  }

  optional(): BorgArray<_.SetOptional<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgArray<_.SetNullable<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgArray<_.SetNullish<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    clone.#flags.optional = true;
    return clone as any;
  }

  required(): BorgArray<_.SetRequired<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgArray<_.SetNotNull<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgArray<_.SetNotNullish<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    clone.#flags.optional = false;
    return clone as any;
  }

  private(): BorgArray<_.SetPrivate<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgArray<_.SetPublic<TFlags>, TLength, TItemSchema> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }

  minLength<const N extends number>(
    length: N,
  ): BorgArray<TFlags, [N, TLength[1]], TItemSchema> {
    const clone = this.copy();
    clone.#min = length;
    return clone as any;
  }

  maxLength<const N extends number>(
    length: N,
  ): BorgArray<TFlags, [TLength[0], N], TItemSchema> {
    const clone = this.copy();
    clone.#max = length;
    return clone as any;
  }
  //TODO: Throw if min > max
  /*TODO:
Can we/should we type the parsed result with the literal length? e.g...

const A = B.Array(B.String().length(1)).length(3).parse(['a', 'b', 'c'])
type A2 = typeof A //--> Array<string & { length: 1 }> & { length: 3 }
--OR--
type A2 = typeof A //--> [string & { length: 1 }, string & { length: 1 }, string & { length: 1 }]
*/
  length<const N extends number>(
    length: N,
  ): BorgArray<TFlags, [N, N], TItemSchema>;
  length<const Min extends number, const Max extends number = Min>(
    minLength: Min,
    maxLength?: Max,
  ): BorgArray<TFlags, [Min, Max], TItemSchema> {
    const clone = this.copy();
    clone.#min = minLength;
    clone.#max = maxLength ?? minLength;
    return clone as any;
  }

  /* c8 ignore next */
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB        SSSSSSSSSSSSS    TTTTTTTTTTTTTTTTTTTT RRRRRRRRRRRRRRRRR     ///
///  B////////////////B     SS/////////////SS  T//////////////////T R////////////////R    ///
///  B/////////////////B  SS/////////////////S T//////////////////T R/////////////////R   ///
///  B//////BBBBBB//////B S///////SSSSS//////S T///TTTT////TTTT///T R//////RRRRRRR/////R  ///
///  BB/////B     B/////B S/////SS    SSSSSSS  T///T  T////T  T///T RR/////R      R////R  ///
///    B////B     B/////B S//////SS            TTTTT  T////T  TTTTT   R////R      R////R  ///
///    B////B     B/////B  SS/////SSS                 T////T          R////R      R////R  ///
///    B////BBBBBB/////B     SS//////SS               T////T          R////RRRRRRR////R   ///
///    B////////////BB         SS//////SS             T////T          R/////////////RR    ///
///    B////BBBBBB/////B         SS//////SS           T////T          R////RRRRRRR////R   ///
///    B////B     B/////B          SSS/////SS         T////T          R////R      R////R  ///
///    B////B     B/////B            SS//////S        T////T          R////R      R////R  ///
///    B////B     B/////B  SSSSSSS    SS/////S        T////T          R////R      R////R  ///
///  BB/////BBBBBB//////B S//////SSSSS///////S      TT//////TT      RR/////R      R////R  ///
///  B/////////////////B  S/////////////////SS      T////////T      R//////R      R////R  ///
///  B////////////////B    SS/////////////SS        T////////T      R//////R      R////R  ///
///  BBBBBBBBBBBBBBBBB       SSSSSSSSSSSSS          TTTTTTTTTT      RRRRRRRR      RRRRRR  ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgString<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TLength extends _.MinMax = [null, null],
  const TPattern extends string = ".*",
> extends _.Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #min: TLength[0] = null;
  #max: TLength[1] = null;
  #regex: RegExp | undefined = undefined;

  constructor() {
    super();
  }

  static #clone<const TBorg extends B.String<any, any, any>>(
    borg: TBorg,
  ): TBorg {
    const clone = new BorgString();
    clone.#flags = { ...borg.#flags };
    clone.#min = borg.#min;
    clone.#max = borg.#max;
    clone.#regex = borg.#regex ? new RegExp(borg.#regex) : undefined;
    return clone as any;
  }

  get meta(): _.StringMeta<TFlags, TLength, TPattern> {
    return Object.freeze({
      ...this.#flags,
      kind: "string",
      maxLength: this.#max,
      minLength: this.#min,
      pattern: this.#regex?.source,
      regex: this.#regex ? Object.freeze(new RegExp(this.#regex)) : undefined,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgString.#clone(this);
  }

  parse(input: unknown): _.Parsed<string, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `STRING_ERROR: Expected string${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `STRING_ERROR: Expected string${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (typeof input !== "string") {
      throw new BorgError(
        `STRING_ERROR: Expected string,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
      );
    }
    if (this.#min !== null && input.length < this.#min) {
      throw new BorgError(
        `STRING_ERROR: Expected string length to be greater than or equal to ${
          this.#min
        }, got ${input.length}`,
      );
    }
    if (this.#max !== null && input.length > this.#max) {
      throw new BorgError(
        `STRING_ERROR: Expected string length to be less than or equal to ${
          this.#max
        }, got ${input.length}`,
      );
    }
    if (this.#regex !== undefined && !this.#regex.test(input)) {
      throw new BorgError(
        `STRING_ERROR: Expected string to match pattern ${
          this.#regex.source
        }, got ${input}`,
      );
    }
    return input as any;
  }
  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `STRING_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
    }
  }

  serialize(input: B.Type<this>): _.Sanitized<B.Type<this>, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(
        `STRING_ERROR: Cannot serialize private string field ${input}`,
      );
    }
    return input as any;
  }

  deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    return input as any;
  }

  toBson(input: B.Type<this>) {
    return input;
  }

  fromBson(input: B.BsonType<this>) {
    return input;
  }

  optional(): BorgString<_.SetOptional<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgString<_.SetNullable<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgString<_.SetNullish<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgString<_.SetRequired<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgString<_.SetNotNull<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgString<_.SetNotNullish<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgString<_.SetPrivate<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgString<_.SetPublic<TFlags>, TLength, TPattern> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }

  minLength<const N extends number>(
    length: N,
  ): BorgString<TFlags, [N, TLength[1]], TPattern> {
    const clone = this.copy();
    clone.#min = length;
    return clone as any;
  }

  maxLength<const N extends number>(
    length: N,
  ): BorgString<TFlags, [TLength[0], N], TPattern> {
    const clone = this.copy();
    clone.#max = length;
    return clone as any;
  }

  length<const N extends number>(length: N): BorgString<TFlags, [N, N]>;
  length<const Min extends number, const Max extends number = Min>(
    minLength: Min,
    maxLength?: Max,
  ): BorgString<TFlags, [Min, Max]> {
    const clone = this.copy();
    clone.#min = minLength;
    clone.#max = maxLength ?? minLength;
    return clone as any;
  }

  /**
   * @IMPORTANT RegExp flags are not supported, except for the "u" flag which is always set.
   * @param pattern a string that will be used as the source for a new RegExp
   */
  pattern<const S extends string>(pattern: S): BorgString<TFlags, TLength, S> {
    const clone = this.copy();
    clone.#regex = new RegExp(pattern, "u");
    return clone as any;
  }

  /* c8 ignore next */
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB    NNNNNNN      NNNNNNN UUUUUUU      UUUUUUU MMMMMMM      MMMMMMM  ///
///  B////////////////B   N//////N     N/////N U/////U      U/////U M//////M    M//////M  ///
///  B/////////////////B  N///////N    N/////N U/////U      U/////U M///////M  M///////M  ///
///  B//////BBBBBB//////B N////////N   N/////N U/////U      U/////U M////////MM////////M  ///
///  BB/////B     B/////B N/////////N  N/////N U/////U      U/////U M//////////////////M  ///
///    B////B     B/////B N//////////N N/////N U/////U      U/////U M/////M//////M/////M  ///
///    B////B     B/////B N///////////NN/////N U/////U      U/////U M/////MM////MM/////M  ///
///    B////BBBBBB/////B  N////////////N/////N U/////U      U/////U M/////M M//M M/////M  ///
///    B////////////BB    N/////N////////////N U/////U      U/////U M/////M  MM  M/////M  ///
///    B////BBBBBB/////B  N/////NN///////////N U/////U      U/////U M/////M      M/////M  ///
///    B////B     B/////B N/////N N//////////N U/////U      U/////U M/////M      M/////M  ///
///    B////B     B/////B N/////N  N/////////N U/////U      U/////U M/////M      M/////M  ///
///    B////B     B/////B N/////N   N////////N U//////U    U//////U M/////M      M/////M  ///
///  BB/////BBBBBB//////B N/////N    N///////N  U//////UUUU//////U  M/////M      M/////M  ///
///  B/////////////////B  N/////N     N//////N   U//////////////U   M/////M      M/////M  ///
///  B////////////////B   N/////N      N/////N    UU//////////UU    M/////M      M/////M  ///
///  BBBBBBBBBBBBBBBBB    NNNNNNN       NNNNNN      UUUUUUUUUU      MMMMMMM      MMMMMMM  ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgNumber<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TLength extends _.MinMax = [null, null],
> extends _.Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #min: TLength[0] = null;
  #max: TLength[1] = null;

  constructor() {
    super();
  }

  static #clone<const TBorg extends B.Number<any, any>>(borg: TBorg): TBorg {
    const clone = new BorgNumber();
    clone.#flags = { ...borg.#flags };
    clone.#min = borg.#min;
    clone.#max = borg.#max;
    return clone as any;
  }

  get meta(): _.NumberMeta<TFlags, TLength> {
    return Object.freeze({
      kind: "number",
      max: this.#max,
      min: this.#min,
      ...this.#flags,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgNumber.#clone(this);
  }

  parse(input: unknown): _.Parsed<number, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `NUMBER_ERROR: Expected number${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `NUMBER_ERROR: Expected number${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (typeof input !== "number") {
      throw new BorgError(
        `NUMBER_ERROR: Expected number,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
      );
    }
    if (this.#min !== null && input < this.#min) {
      throw new BorgError(
        `NUMBER_ERROR: Expected number to be greater than or equal to ${
          this.#min
        }`,
      );
    }
    if (this.#max !== null && input > this.#max) {
      throw new BorgError(
        `NUMBER_ERROR: Expected number to be less than or equal to ${
          this.#max
        }`,
      );
    }
    return input as any;
  }

  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `NUMBER_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
    }
  }

  serialize(input: B.Type<this>): _.Sanitized<B.Type<this>, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(
        `NUMBER_ERROR: Cannot serialize private number field ${input}`,
      );
    }
    return input as any;
  }

  deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    return input as any;
  }

  toBson(input: B.Type<this>): _.Parsed<Double, TFlags> {
    return typeof input === "number" ? new Double(input) : (input as any);
  }

  fromBson(input: B.BsonType<this>): B.Type<this> {
    return (input && "valueOf" in input ? input.valueOf() : input) as any;
  }

  optional(): BorgNumber<_.SetOptional<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgNumber<_.SetNullable<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgNumber<_.SetNullish<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgNumber<_.SetRequired<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgNumber<_.SetNotNull<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgNumber<_.SetNotNullish<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgNumber<_.SetPrivate<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgNumber<_.SetPublic<TFlags>, TLength> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }
  /*TODO:
  If max is set, and min is then set to a value greater than max,
  remove max. If min is set, and max is then set to a value less than
  min, remove min.
  */
  min<const N extends number>(min: N): BorgNumber<TFlags, [N, TLength[1]]> {
    const clone = this.copy();
    clone.#min = min;
    return clone as any;
  }

  max<const N extends number>(max: N): BorgNumber<TFlags, [TLength[0], N]> {
    const clone = this.copy();
    clone.#max = max;
    return clone as any;
  }
  /**
   * Inclusive range
   */
  range<const N extends number, const M extends number>(
    min: N,
    max: M,
  ): BorgNumber<TFlags, [N, M]> {
    const clone = this.copy();
    clone.#min = min;
    clone.#max = max;
    return clone as any;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB        OOOOOOOOOOOO         OOOOOOOOOOOO     LLLLLLLLLL            ///
///  B////////////////B     OO////////////OO     OO////////////OO   L////////L            ///
///  B/////////////////B   OO//////////////OO   OO//////////////OO  L////////L            ///
///  B//////BBBBBB//////B O///////OOO////////O O///////OOO////////O L////////L            ///
///  BB/////B     B/////B O//////O   O///////O O//////O   O///////O L////////L            ///
///    B////B     B/////B O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////B     B/////B O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////BBBBBB/////B  O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////////////BB    O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////BBBBBB/////B  O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////B     B/////B O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////B     B/////B O/////O     O//////O O/////O     O//////O L//////L              ///
///    B////B     B/////B O/////O     O//////O O/////O     O//////O L//////L              ///
///  BB/////BBBBBB//////B O///////OOO////////O O///////OOO////////O L//////LLLLLLLLLLLLL  ///
///  B/////////////////B  OO///////////////OO  OO///////////////OO  L//////////////////L  ///
///  B////////////////B    OO/////////////OO    OO/////////////OO   L//////////////////L  ///
///  BBBBBBBBBBBBBBBBB       OOOOOOOOOOOOOO       OOOOOOOOOOOOOO    LLLLLLLLLLLLLLLLLLLL  ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgBoolean<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
> extends _.Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  constructor() {
    super();
  }

  static #clone<const TBorg extends B.Boolean<any>>(borg: TBorg): TBorg {
    const clone = new BorgBoolean();
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): _.BooleanMeta<TFlags> {
    return Object.freeze({
      kind: "boolean",
      ...this.#flags,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgBoolean.#clone(this);
  }

  parse(input: unknown): _.Parsed<boolean, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `BOOLEAN_ERROR: Expected boolean${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `BOOLEAN_ERROR: Expected boolean${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (typeof input !== "boolean") {
      throw new BorgError(
        `BOOLEAN_ERROR: Expected boolean,${
          this.#flags.optional ? " or undefined," : ""
        }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
      );
    }
    return input as any;
  }

  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `BOOLEAN_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
      }
  }

  serialize(input: B.Type<this>): _.Sanitized<B.Type<this>, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(
        `BOOLEAN_ERROR: Cannot serialize private boolean field`,
      );
    }
    return input as any;
  }

  deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    return input as any;
  }

  toBson(input: B.Type<this>): _.Parsed<boolean, TFlags> {
    return input as any;
  }

  fromBson(input: B.BsonType<this>): B.Type<this> {
    return input;
  }

  optional(): BorgBoolean<_.SetOptional<TFlags>> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgBoolean<_.SetNullable<TFlags>> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgBoolean<_.SetNullish<TFlags>> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgBoolean<_.SetRequired<TFlags>> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgBoolean<_.SetNotNull<TFlags>> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgBoolean<_.SetNotNullish<TFlags>> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgBoolean<_.SetPrivate<TFlags>> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgBoolean<_.SetPublic<TFlags>> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB                         IIIIIIIIIIIIIIIIIIII DDDDDDDDDDDDDDD       ///
///  B////////////////B                        I//////////////////I D//////////////DD     ///
///  B/////////////////B                       I//////////////////I D///////////////DD    ///
///  B//////BBBBBB//////B                      IIIIIII//////IIIIIII D/////DDDDDD/////DD   ///
///  BB/////B     B/////B                             I////I        D/////D    DD/////DD  ///
///    B////B     B/////B                             I////I        D/////D     DD/////D  ///
///    B////B     B/////B                             I////I        D/////D      D/////D  ///
///    B////BBBBBB/////B                              I////I        D/////D      D/////D  ///
///    B////////////BB                                I////I        D/////D      D/////D  ///
///    B////BBBBBB/////B                              I////I        D/////D      D/////D  ///
///    B////B     B/////B                             I////I        D/////D      D/////D  ///
///    B////B     B/////B                             I////I        D/////D     DD/////D  ///
///    B////B     B/////B                             I////I        D/////D    DD/////DD  ///
///  BB/////BBBBBB//////B #################### IIIIIII//////IIIIIII D/////DDOOOD/////DD   ///
///  B/////////////////B  #//////////////////# I//////////////////I D///////////////DD    ///
///  B////////////////B   #//////////////////# I//////////////////I D//////////////DD     ///
///  BBBBBBBBBBBBBBBBB    #################### IIIIIIIIIIIIIIIIIIII DDDDDDDDDDDDDDD       ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

class BorgId<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TFormat extends string | ObjectId = string,
> extends _.Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #format = true;

  constructor() {
    super();
  }

  static #clone<const TBorg extends B.Id<any, any>>(borg: TBorg): TBorg {
    const clone = new BorgId();
    clone.#flags = { ...borg.#flags };
    clone.#format = borg.#format;
    return clone as any;
  }

  static isObjectIdLike(input: unknown): input is _.ObjectIdLike {
    if (typeof input !== "object" || input === null) return false;
    return (
      "toHexString" in input &&
      "id" in input &&
      typeof input.toHexString === "function" &&
      (typeof input.id === "string" || input.id instanceof Uint8Array)
    );
  }

  get meta(): _.IdMeta<TFlags, TFormat> {
    return Object.freeze({
      kind: "id",
      format: this.#format ? "string" : "oid",
      ...this.#flags,
    }) as any;
  }

  get bsonSchema() {
    return _.getBsonSchema(this.meta);
  }

  copy(): this {
    return BorgId.#clone(this);
  }

  parse(input: unknown): _.Parsed<TFormat, TFlags> {
    if (input === undefined) {
      if (this.#flags.optional) return void 0 as any;
      throw new BorgError(
        `ID_ERROR: Expected valid ObjectId${
          this.#flags.nullable ? " or null" : ""
        }, got undefined`,
      );
    }
    if (input === null) {
      if (this.#flags.nullable) return null as any;
      throw new BorgError(
        `ID_ERROR: Expected valid ObjectId${
          this.#flags.optional ? " or undefined" : ""
        }, got null`,
      );
    }
    if (typeof input === "string") {
      if (ObjectId.isValid(input))
        return this.#format
          ? (input as any)
          : ObjectId.createFromHexString(input);
    }
    if (typeof input === "number") {
      const hex = input.toString(16);
      if (ObjectId.isValid(input))
        return this.#format ? (hex as any) : ObjectId.createFromHexString(hex);
    }
    if (input instanceof Uint8Array) {
      const hex = Buffer.from(input).toString("hex");
      if (ObjectId.isValid(input))
        return this.#format ? (hex as any) : ObjectId.createFromHexString(hex);
    }
    if (BorgId.isObjectIdLike(input)) {
      const hex = input.toHexString();
      if (ObjectId.isValid(input))
        return this.#format ? (hex as any) : ObjectId.createFromHexString(hex);
    }
    if (input instanceof ObjectId) {
      return this.#format ? input.toHexString() : (input as any);
    }
    throw new BorgError(
      `ID_ERROR: Expected valid ObjectId,${
        this.#flags.optional ? " or undefined," : ""
      }${this.#flags.nullable ? " or null," : ""} got ${typeof input}`,
    );
  }

  try(input: unknown): _.TryResult<this> {
    try {
      const value = this.parse(input) as any;
      return {
        value,
        ok: true,
        meta: this.meta,
        serialize: () => this.serialize.call(this, value),
      } as any;
    } catch (e) {
      if (e instanceof BorgError) return { ok: false, error: e } as any;
      else
        return {
          ok: false,
          error: new BorgError(
            `ID_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(e)}`,
          )
        } as any;
    }
  }

  serialize(input: B.Type<this>): _.Sanitized<string, TFlags> {
    if (this.#flags.private) {
      throw new BorgError(`ID_ERROR: Cannot serialize private ID field`);
    }
    if (input === undefined || input === null) return input as any;
    if (typeof input === "string") return input as any;
    return input.toHexString() as any;
  }

  deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    if (input === undefined || input === null) return input as any;
    if (this.#format) return input as any;
    return ObjectId.createFromHexString(input) as any;
  }

  toBson(input: B.Type<this>): _.Parsed<ObjectId, TFlags> {
    if (input === undefined || input === null) return input as any;
    if (input instanceof ObjectId) return input as any;
    return ObjectId.createFromHexString(input) as any;
  }

  fromBson(input: B.BsonType<this>): B.Type<this> {
    if (input === undefined || input === null) return input as any;
    if (!this.#format) return input as any;
    return input.toHexString() as any;
  }

  optional(): BorgId<_.SetOptional<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgId<_.SetNullable<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgId<_.SetNullish<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgId<_.SetRequired<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgId<_.SetNotNull<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgId<_.SetNotNullish<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgId<_.SetPrivate<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgId<_.SetPublic<TFlags>, TFormat> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }

  asString(): BorgId<TFlags, string> {
    const clone = this.copy();
    clone.#format = true as any;
    return clone as any;
  }

  asObjectId(): BorgId<TFlags, ObjectId> {
    const clone = this.copy();
    clone.#format = false as any;
    return clone as any;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB    MMMMMMM      MMMMMMM     OOOOOOOOOOOO     DDDDDDDDDDDDDDD       ///
///  B////////////////B   M//////M    M//////M   OO////////////OO   D//////////////DD     ///
///  B/////////////////B  M///////M  M///////M  OO//////////////OO  D///////////////DD    ///
///  B//////BBBBBB//////B M////////MM////////M O///////OOO////////O D/////DDDDDD/////DD   ///
///  BB/////B     B/////B M//////////////////M O//////O   O///////O D/////D    DD/////DD  ///
///    B////B     B/////B M/////M//////M/////M O/////O     O//////O D/////D     DD/////D  ///
///    B////B     B/////B M/////MM////MM/////M O/////O     O//////O D/////D      D/////D  ///
///    B////BBBBBB/////B  M/////M M//M M/////M O/////O     O//////O D/////D      D/////D  ///
///    B////////////BB    M/////M  MM  M/////M O/////O     O//////O D/////D      D/////D  ///
///    B////BBBBBB/////B  M/////M      M/////M O/////O     O//////O D/////D      D/////D  ///
///    B////B     B/////B M/////M      M/////M O/////O     O//////O D/////D      D/////D  ///
///    B////B     B/////B M/////M      M/////M O/////O     O//////O D/////D     DD/////D  ///
///    B////B     B/////B M/////M      M/////M O//////O   O///////O D/////D    DD/////DD  ///
///  BB/////BBBBBB//////B M/////M      M/////M O///////OOO////////O D/////DDOOOD/////DD   ///
///  B/////////////////B  M/////M      M/////M OO///////////////OO  D///////////////DD    ///
///  B////////////////B   M/////M      M/////M  OO/////////////OO   D//////////////DD     ///
///  BBBBBBBBBBBBBBBBB    MMMMMMM      MMMMMMM    OOOOOOOOOOOOOO    DDDDDDDDDDDDDDD       ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

function makeBorg<TSchema extends BorgObject<_.Flags>>(
  schema: TSchema,
): _.BorgModel<TSchema>;
function makeBorg<
  TSchema extends BorgObject<_.Flags>,
  TServerModel extends object,
>(
  schema: TSchema,
  transformInput: (input: B.Type<TSchema>) => TServerModel,
): _.BorgModel<TSchema, TServerModel>;
function makeBorg<
  TInputSchema extends BorgObject<_.Flags>,
  TServerModel extends object,
  TOutputSchema extends BorgObject<_.Flags>,
>(
  inputSchema: TInputSchema,
  transformInput: (input: B.Type<TInputSchema>) => TServerModel,
  transformOutput: (input: TServerModel) => B.Type<TOutputSchema>,
  outputSchema: TOutputSchema,
): _.BorgModel<TInputSchema, TServerModel, TOutputSchema>;

function makeBorg<
  TInputSchema extends BorgObject<_.Flags>,
  TServerModel extends object,
  TOutputSchema extends BorgObject<_.Flags>,
>(
  schema: TInputSchema,
  transformInput: (input: B.Type<TInputSchema>) => TServerModel = (
    input: B.Type<TInputSchema>,
  ) => input as any,
  transformOutput: (input: TServerModel) => B.Type<TOutputSchema> = (
    input: TServerModel,
  ) => input as any,
  outputSchema: TOutputSchema = schema as any,
): _.BorgModel<TInputSchema, TServerModel, TOutputSchema> {
  /*TODO
  Modify output parsing so that fields not
  present in the output schema pass through untouched.
  When building a client parser, we can use the shape of the input schema,
  and replace the modified fields with those from the output schema.
*/
  return {
    createFromRequest: input => transformOutput(transformInput(input)),
    sanitizeResponse: input => transformOutput(input),
    serializeInput: parsedInput => schema.serialize(parsedInput) as any,
    deserializeInput: serializedInput => schema.parse(serializedInput) as any,
    serializeOutput: parsedOutput =>
      outputSchema.serialize(parsedOutput) as any,
    deserializeOutput: serializedOutput =>
      outputSchema.parse(serializedOutput) as any,
    parseInput: input => schema.parse(input) as any,
    parseOutput: input => outputSchema.parse(input) as any,
  };
}

const B = {
  id: () => new BorgId(),
  string: () => new BorgString(),
  number: () => new BorgNumber(),
  boolean: () => new BorgBoolean(),
  array: <const T extends _.Borg>(itemSchema: T) => new BorgArray(itemSchema),
  object: <const T extends { [key: string]: _.Borg }>(shape: T) =>
    new BorgObject(shape),
  model: makeBorg,
};

declare module B {
  export type Boolean<TFlags extends _.Flags = _.Flags> = BorgBoolean<TFlags>;

  export type Id<
    TFlags extends _.Flags = _.Flags,
    TFormat extends "string" | "oid" = "string" | "oid",
  > = BorgId<TFlags, TFormat>;

  export type Number<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
  > = BorgNumber<TFlags, TLength>;

  export type String<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TPattern extends string = string,
  > = BorgString<TFlags, TLength, TPattern>;

  export type Array<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TItems extends _.Borg = _.Borg,
  > = BorgArray<TFlags, TLength, TItems>;

  export type Object<
    TFlags extends _.Flags = _.Flags,
    TShape extends { [key: string]: _.Borg } = { [key: string]: _.Borg },
  > = BorgObject<TFlags, TShape>;

  export type Borg = _.Borg;
  export type Type<T extends _.Borg> = _.Type<T>;
  export type BsonType<T extends _.Borg> = _.BsonType<T>;
  export type Serialized<T extends _.Borg> = _.Serialized<T>;
  export type Deserialized<T extends _.Borg> = _.Deserialized<T>;
  export type AnyBorg =
    | B.Object
    | B.Array
    | B.String
    | B.Number
    | B.Boolean
    | B.Id;
}

export default B;
