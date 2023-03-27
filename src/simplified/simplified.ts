//@ts-nocheck
import { BorgError } from "../errors";
import _ from "../types/utils"
import Meta from "../types/Meta";

const isin = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
  key in obj;

/////////////////////////////////////////////////////////////////////////////////////////////
///                                                                                       ///
///  BBBBBBBBBBBBBBBBB        OOOOOOOOOOOO     RRRRRRRRRRRRRRRRR        GGGGGGGGGGG       ///
///  B////////////////B     OO////////////OO   R////////////////R     GG///////////GG     ///
///  B/////////////////B   OO//////////////OO  R/////////////////R   GG/////////////GG    ///
///  B//////BBBBBB//////B O///////OOO////////O R//////RRRRRRR/////R G/////GGGGGGG/////G   ///
///  BB/////B     B/////B O//////O   O///////O RR/////R      R////R G////G       G////G   ///
///    B////B     B/////B O/////O     O//////O   R////R      R////R G////G       GGGGGG   ///
///    B////B     B/////B O/////O     O//////O   R////R      R////R G////G                ///
///    B////BBBBBB/////B  O/////O     O//////O   R////RRRRRRR////R  G////G   GGGGGGGG     ///
///    B////////////BB    O/////O     O//////O   R/////////////RR   G////G  GG///////GG   ///
///    B////BBBBBB/////B  O/////O     O//////O   R////RRRRRRR////R  G////G  G/////////GG  ///
///    B////B     B/////B O/////O     O//////O   R////R      R////R G////G  G////G/////G  ///
///    B////B     B/////B O/////O     O//////O   R////R      R////R G////G   GGGG G////G  ///
///    B////B     B/////B O//////O   O///////O   R////R      R////R G/////G      GG////G  ///
///  BB/////BBBBBB//////B O///////OOO////////O RR/////R      R////R G//////GGGGGG//////G  ///
///  B/////////////////B  OO///////////////OO  R//////R      R////R  GG////////////////G  ///
///  B////////////////B    OO/////////////OO   R//////R      R////R    GG///////GG/////G  ///
///  BBBBBBBBBBBBBBBBB       OOOOOOOOOOOOOO    RRRRRRRR      RRRRRR     GGGGGGGG  GGGGGG  ///
///                                                                                       ///
/////////////////////////////////////////////////////////////////////////////////////////////

/*TODO: type BorgOptions = { exactOptionalProperties?: Boolean | undefined;} */
export abstract class Borg {
  abstract get meta(): Meta.GenericMeta;
  abstract is(input: unknown): input is B.Type<Borg>;
  abstract try(input: unknown): B.TryResult<Borg>;
  abstract parse(input: unknown): unknown;
  abstract serialize(input: any): any;
  abstract copy(): Borg;
  abstract private(): any;
  abstract public(): any;
  abstract optional(): any;
  abstract nullable(): any;
  abstract nullish(): any;
  abstract required(): any;
  abstract notNull(): any;
  abstract notNullish(): any;
  /* c8 ignore next */
}

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

export class BorgObject<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TShape extends { [key: string]: Borg } = {
    [key: string]: Borg;
  },
> extends Borg {
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
    const newShape = {} as { [key: string]: Borg };
    for (const key in borg.#shape) newShape[key] = borg.#shape[key]!.copy();
    const clone = new BorgObject(newShape);
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): Meta.ObjectMeta<TFlags, TShape> {
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

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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

  try(input: unknown): B.TryResult<BorgObject<TFlags, TShape>> {
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
            `OBJECT_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(
              e,
            )}`,
          ),
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

export class BorgArray<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TLength extends _.MinMax = [null, null],
  const TItemSchema extends Borg = Borg,
> extends Borg {
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

  get meta(): Meta.ArrayMeta<TFlags, TLength, TItemSchema> {
    return Object.freeze({
      kind: "array",
      maxItems: this.#max,
      minItems: this.#min,
      itemSchema: this.#itemSchema,
      ...this.#flags,
    }) as any;
  }

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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

  try(input: unknown): B.TryResult<BorgArray<TFlags, TLength, TItemSchema>> {
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
          ),
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
  length<const N extends number | null>(
    length: N,
  ): BorgArray<TFlags, [N, N], TItemSchema>;
  length<const Min extends number | null, const Max extends number | null = Min>(
    minLength: Min,
    maxLength?: Max,
  ): BorgArray<TFlags, [Min, Max], TItemSchema> {
    const clone = this.copy();
    clone.#min = minLength;
    clone.#max = maxLength === undefined ? minLength : maxLength;
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

export class BorgString<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TLength extends _.MinMax = [null, null],
  const TPattern extends string = ".*",
> extends Borg {
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

  get meta(): Meta.StringMeta<TFlags, TLength, TPattern> {
    return Object.freeze({
      ...this.#flags,
      kind: "string",
      maxLength: this.#max,
      minLength: this.#min,
      pattern: this.#regex?.source,
      regex: this.#regex ? Object.freeze(new RegExp(this.#regex)) : undefined,
    }) as any;
  }

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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
  try(input: unknown): B.TryResult<BorgString<TFlags, TLength, TPattern>> {
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
            `STRING_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(
              e,
            )}`,
          ),
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

  minLength<const N extends number | null>(
    length: N,
  ): BorgString<TFlags, [N, TLength[1]], TPattern> {
    const clone = this.copy();
    clone.#min = length;
    return clone as any;
  }

  maxLength<const N extends number | null>(
    length: N,
  ): BorgString<TFlags, [TLength[0], N], TPattern> {
    const clone = this.copy();
    clone.#max = length;
    return clone as any;
  }

  length<const N extends number | null>(length: N): BorgString<TFlags, [N, N]>;
  length<const Min extends number | null, const Max extends number | null = Min>(
    minLength: Min,
    maxLength?: Max,
  ): BorgString<TFlags, [Min, Max]> {
    const clone = this.copy();
    clone.#min = minLength;
    clone.#max = maxLength === undefined ? minLength : maxLength;
    return clone as any;
  }

  /**
   * @IMPORTANT RegExp flags are not supported, except for the "u" flag which is always set.
   * @param pattern a string that will be used as the source for a new RegExp
   */
  pattern<const S extends string>(pattern: S): BorgString<TFlags, TLength, S> {
    const clone = this.copy();
    clone.#regex = new RegExp(pattern, "u"); //FIXME: Regex should be null if not set, so we can unset it without passing '.*' as pattern.
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

export class BorgNumber<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
  const TRange extends _.MinMax = [null, null],
> extends Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #min: TRange[0] = null;
  #max: TRange[1] = null;

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

  get meta(): Meta.NumberMeta<TFlags, TRange> {
    return Object.freeze({
      kind: "number",
      max: this.#max,
      min: this.#min,
      ...this.#flags,
    }) as any;
  }

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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

  try(input: unknown): B.TryResult<BorgNumber<TFlags, TRange>> {
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
            `NUMBER_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(
              e,
            )}`,
          ),
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

  optional(): BorgNumber<_.SetOptional<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): BorgNumber<_.SetNullable<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): BorgNumber<_.SetNullish<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): BorgNumber<_.SetRequired<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): BorgNumber<_.SetNotNull<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): BorgNumber<_.SetNotNullish<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): BorgNumber<_.SetPrivate<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): BorgNumber<_.SetPublic<TFlags>, TRange> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }
  /*TODO:
  If max is set, and min is then set to a value greater than max,
  remove max. If min is set, and max is then set to a value less than
  min, remove min.
  */
  min<const N extends number>(min: N): BorgNumber<TFlags, [N, TRange[1]]> {
    const clone = this.copy();
    clone.#min = min;
    return clone as any;
  }

  max<const N extends number>(max: N): BorgNumber<TFlags, [TRange[0], N]> {
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

export class BorgBoolean<
  const TFlags extends _.Flags = ["required", "notNull", "public"],
> extends Borg {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  constructor() {
    super();
  }

  static #clone<const TBorg extends BorgBoolean<any>>(borg: TBorg): TBorg {
    const clone = new BorgBoolean();
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): Meta.BooleanMeta<TFlags> {
    return Object.freeze({
      kind: "boolean",
      ...this.#flags,
    }) as any;
  }

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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

  try(input: unknown): B.TryResult<BorgBoolean<TFlags>> {
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
            `BOOLEAN_ERROR(try): Unknown error parsing: \n\t${JSON.stringify(
              e,
            )}`,
          ),
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

const B = {
  string: () => new BorgString(),
  number: () => new BorgNumber(),
  boolean: () => new BorgBoolean(),
  array: <const T extends Borg>(itemSchema: T) => new BorgArray(itemSchema),
  object: <const T extends { [key: string]: Borg }>(shape: T) =>
    new BorgObject(shape),
};

declare module B {
  export type Boolean<TFlags extends _.Flags = _.Flags> = BorgBoolean<TFlags>;

  export type Number<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
  > = InstanceType<typeof BorgNumber<TFlags, TLength>>;

  export type String<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TPattern extends string = string,
  > = InstanceType<typeof BorgString<TFlags, TLength, TPattern>>;

  export type Array<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TItems extends Borg = Borg,
  > = InstanceType<typeof BorgArray<TFlags, TLength, TItems>>;

  export type Object<
    TFlags extends _.Flags = _.Flags,
    TShape extends { [key: string]: Borg } = { [key: string]: Borg },
  > = InstanceType<typeof BorgObject<TFlags, TShape>>;

  export type Borg = InstanceType<typeof Borg>;

  export type Type<TBorg extends { parse: (arg0: unknown) => any }> =
    ReturnType<TBorg["parse"]>;

  export type Serialized<TBorg extends { serialize: (arg0: any) => any }> =
    ReturnType<TBorg["serialize"]>;

  export type TryResult<TBorg> = TBorg extends infer B extends { parse: (arg0: unknown) => any, serialize: (arg0: any) => any }
    ?
        | {
            ok: true;
            value: Type<B>;
            meta: MetaFromBorg<B>;
            serialize: () => Serialized<B>;
          }
        | {
            ok: false;
            error: BorgError;
          }
    : never;

export type MetaFromBorg<TBorg> = TBorg extends BorgObject<
  infer TFlags extends _.Flags,
  infer TShape extends { [key: string]: Borg }
>
  ? Meta.ObjectMeta<TFlags, TShape>
  : TBorg extends BorgArray<infer TFlags extends _.Flags, infer TLength extends _.MinMax, infer TItemBorg extends Borg>
  ? Meta.ArrayMeta<TFlags, TLength, TItemBorg>
  : TBorg extends BorgString<infer TFlags extends _.Flags, infer TLength extends _.MinMax, infer TPattern extends string>
  ? Meta.StringMeta<TFlags, TLength, TPattern>
  : TBorg extends BorgNumber<infer TFlags extends _.Flags, infer TRange extends _.MinMax>
  ? Meta.NumberMeta<TFlags, TRange>
  : TBorg extends BorgBoolean<infer TFlags extends _.Flags>
  ? Meta.BooleanMeta<TFlags>
  : Meta.GenericMeta

  export type AnyBorg =
    | B.Object
    | B.Array
    | B.String
    | B.Number
    | B.Boolean
}

export default B;
