import { BorgError } from "./errors";
import _ from "./types/utils";

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

type GenericMeta = {
  [key: string]: unknown;
  kind: string;
  optional: boolean;
  nullable: boolean;
  private: boolean;
};

/*TODO: type BorgOptions = { exactOptionalProperties?: Boolean | undefined;} */
export abstract class Borg<
  const TMeta extends { [key: string]: unknown; kind: string } = GenericMeta,
> {
  abstract get meta(): TMeta;
  abstract is<T extends Borg>(this: T, input: unknown): input is B.Type<T>;
  abstract try<T extends Borg>(
    this: T,
    input: unknown,
  ): B.TryResult<ReturnType<T["parse"]>, ReturnType<T["serialize"]>, TMeta>;
  abstract parse(input: unknown): unknown;
  abstract serialize(input: any): any;
  abstract copy(): Borg;

  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  optional<T extends B.AnyBorg>(this: T): B.SetOptional<T> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable<T extends B.AnyBorg>(this: T): B.SetNullable<T> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish<T extends B.AnyBorg>(this: T): B.SetNullish<T> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    clone.#flags.optional = true;
    return clone as any;
  }

  required<T extends B.AnyBorg>(this: T): B.SetRequired<T> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull<T extends B.AnyBorg>(this: T): B.SetNullable<T> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish<T extends B.AnyBorg>(this: T): B.SetNullish<T> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    clone.#flags.optional = false;
    return clone as any;
  }

  public<T extends B.AnyBorg>(this: T): B.SetPublic<T> {
    const clone = this.copy();
    clone.#flags.private = false;
    return clone as any;
  }

  private<T extends B.AnyBorg>(this: T): B.SetPrivate<T> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }
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

type ObjectMeta<TOpts extends ObjectParams> = _.PrettyPrint<
  {
    kind: "object";
    keys: Array<Extract<keyof TOpts[3], string>>;
    requiredKeys: _.RequiredKeysArray<TOpts[3]>;
    borgShape: TOpts[3];
  } & _.GetFlags<[TOpts[0], TOpts[1], TOpts[2]]>
>;

type ObjectParams = [
  _.RequiredFlag,
  _.NullFlag,
  _.PrivateFlag,
  { [key: string]: Borg },
];

export class BorgObject<const TOpts extends ObjectParams> extends Borg<
  ObjectMeta<TOpts>
> {
  #shape: TOpts[3];
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  constructor(shape: TOpts[3]) {
    super();
    this.#shape = Object.freeze(
      Object.fromEntries(
        Object.entries(shape).map(([key, value]) => [key, value.copy()]),
      ),
    ) as any;
  }

  static #clone<
    const TBorg extends BorgObject<[any, any, any, { [key: string]: Borg }]>,
  >(borg: TBorg): TBorg {
    const newShape = {} as { [key: string]: Borg };
    for (const key in borg.#shape) newShape[key] = borg.#shape[key]!.copy();
    const clone = new BorgObject(newShape);
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): ObjectMeta<TOpts> {
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

  is(input: unknown): input is B.Type<this> {
    return this.try(input).ok;
  }

  copy(): this {
    return BorgObject.#clone(this);
  }

  parse(
    input: unknown,
  ): _.Parsed<
    { [k in keyof TOpts[3]]: B.Type<TOpts[3][k]> },
    [TOpts[0], TOpts[1], TOpts[2]]
  > {
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

  try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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
  ): _.Sanitized<
    { [k in keyof TOpts[3]]: B.Serialized<TOpts[3][k]> },
    [TOpts[0], TOpts[1], TOpts[2]]
  > {
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

  //TODO: Should we be treating 'undefined' in any special way when converting to BSON?

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

type ArrayMeta<TOpts extends ArrayParams> = _.PrettyPrint<
  {
    borgItems: TOpts[4];
    kind: "array";
    maxItems: TOpts[3][1];
    minItems: TOpts[3][0];
  } & _.GetFlags<[TOpts[0], TOpts[1], TOpts[2]]>
>;

type ArrayParams = [_.RequiredFlag, _.NullFlag, _.PrivateFlag, _.MinMax, Borg];

export class BorgArray<TOpts extends ArrayParams> extends Borg<
  ArrayMeta<TOpts>
> {
  #itemSchema: TOpts[4];
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #max: TOpts[3][1] = null;
  #min: TOpts[3][0] = null;

  constructor(itemSchema: TOpts[4]) {
    super();
    this.#itemSchema = itemSchema.copy() as any;
  }

  static #clone<
    const TBorg extends BorgArray<[any, any, any, [any, any], Borg]>,
  >(borg: TBorg): TBorg {
    const clone = new BorgArray(borg.#itemSchema.copy());
    clone.#flags = { ...borg.#flags };
    clone.#max = borg.#max;
    clone.#min = borg.#min;
    return clone as any;
  }

  get meta(): ArrayMeta<TOpts> {
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

  parse(
    input: unknown,
  ): _.Parsed<Array<B.Type<TOpts[4]>>, [TOpts[0], TOpts[1], TOpts[2]]> {
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

  try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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
  ): _.Sanitized<
    Array<B.Serialized<TOpts[4]>>,
    [TOpts[0], TOpts[1], TOpts[2]]
  > {
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

  minLength<const N extends number>(
    length: N,
  ): BorgArray<[TOpts[0], TOpts[1], TOpts[2], [N, TOpts[3][1]], TOpts[4]]> {
    const clone = this.copy();
    clone.#min = length;
    return clone as any;
  }

  maxLength<const N extends number>(
    length: N,
  ): BorgArray<[TOpts[0], TOpts[1], TOpts[2], [TOpts[3][0], N], TOpts[4]]> {
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
  ): BorgArray<[TOpts[0], TOpts[1], TOpts[2], [N, N], TOpts[4]]>;
  length<
    const Min extends number | null,
    const Max extends number | null = Min,
  >(
    minLength: Min,
    maxLength?: Max,
  ): BorgArray<[TOpts[0], TOpts[1], TOpts[2], [Min, Max], TOpts[4]]> {
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

type StringMeta<TOpts extends StringParams> = _.PrettyPrint<
  {
    kind: "string";
    maxLength: TOpts[3][1];
    minLength: TOpts[3][0];
    pattern: TOpts[4];
    regex: TOpts[4] extends ".*" ? undefined : RegExp;
  } & _.GetFlags<[TOpts[0], TOpts[1], TOpts[2]]>
>;

type StringParams = [
  _.RequiredFlag,
  _.NullFlag,
  _.PrivateFlag,
  _.MinMax,
  string,
];

export class BorgString<TOpts extends StringParams> extends Borg<
  StringMeta<TOpts>
> {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #min: TOpts[3][0] = null;
  #max: TOpts[3][1] = null;
  #pattern: TOpts[4] | null = null;

  constructor() {
    super();
  }

  static #clone<
    const TBorg extends BorgString<[any, any, any, [any, any], any]>,
  >(borg: TBorg): TBorg {
    const clone = new BorgString();
    clone.#flags = { ...borg.#flags };
    clone.#min = borg.#min;
    clone.#max = borg.#max;
    clone.#pattern = borg.#pattern;
    return clone as any;
  }

  get meta(): StringMeta<TOpts> {
    return Object.freeze({
      ...this.#flags,
      kind: "string",
      maxLength: this.#max,
      minLength: this.#min,
      pattern: this.#pattern,
      regex: this.#pattern
        ? Object.freeze(new RegExp(this.#pattern))
        : undefined,
    }) as any;
  }

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
  }

  copy(): this {
    return BorgString.#clone(this);
  }

  parse(input: unknown): _.Parsed<string, [TOpts[0], TOpts[1], TOpts[2]]> {
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
    if (this.#pattern !== null && !new RegExp(this.#pattern).test(input)) {
      throw new BorgError(
        `STRING_ERROR: Expected string to match pattern ${
          this.#pattern
        }, got ${input}`,
      );
    }
    return input as any;
  }
    try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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

  serialize(
    input: B.Type<this>,
  ): _.Sanitized<B.Type<this>, [TOpts[0], TOpts[1], TOpts[2]]> {
    if (this.#flags.private) {
      throw new BorgError(
        `STRING_ERROR: Cannot serialize private string field ${input}`,
      );
    }
    return input as any;
  }

  minLength<const N extends number | null>(
    length: N,
  ): BorgString<[TOpts[0], TOpts[1], TOpts[2], [N, TOpts[3][1]], TOpts[4]]> {
    const clone = this.copy();
    clone.#min = length;
    return clone as any;
  }

  maxLength<const N extends number | null>(
    length: N,
  ): BorgString<[TOpts[0], TOpts[1], TOpts[2], [TOpts[3][0], N], TOpts[4]]> {
    const clone = this.copy();
    clone.#max = length;
    return clone as any;
  }

  length<const N extends number | null>(
    length: N,
  ): BorgString<[TOpts[0], TOpts[1], TOpts[2], [N, N], TOpts[4]]>;
  length<
    const Min extends number | null,
    const Max extends number | null = Min,
  >(
    minLength: Min,
    maxLength?: Max,
  ): BorgString<[TOpts[0], TOpts[1], TOpts[2], [Min, Max], TOpts[4]]> {
    const clone = this.copy();
    clone.#min = minLength;
    clone.#max = maxLength === undefined ? minLength : maxLength;
    return clone as any;
  }

  /**
   * @IMPORTANT RegExp flags are not supported, except for the "u" flag which is always set.
   * @param pattern a string that will be used as the source for a new RegExp
   */
  pattern<const S extends string | null>(
    pattern: S,
  ): BorgString<
    [TOpts[0], TOpts[1], TOpts[2], TOpts[3], S extends null ? ".*" : S]
  > {
    const clone = this.copy();
    clone.#pattern = pattern as any;
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

type NumberMeta<TOpts extends NumberParams> = _.PrettyPrint<
  {
    kind: "number";
    min: TOpts[3][0];
    max: TOpts[3][1];
  } & _.GetFlags<[TOpts[0], TOpts[1], TOpts[2]]>
>;

type NumberParams = [_.RequiredFlag, _.NullFlag, _.PrivateFlag, _.MinMax];

export class BorgNumber<const TOpts extends NumberParams> extends Borg<
  NumberMeta<TOpts>
> {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #min: TOpts[3][0] = null;
  #max: TOpts[3][1] = null;

  constructor() {
    super();
  }

  static #clone<const TBorg extends BorgNumber<[any, any, any, [any, any]]>>(
    borg: TBorg,
  ): TBorg {
    const clone = new BorgNumber();
    clone.#flags = { ...borg.#flags };
    clone.#min = borg.#min;
    clone.#max = borg.#max;
    return clone as any;
  }

  get meta(): NumberMeta<TOpts> {
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

  parse(input: unknown): _.Parsed<number, [TOpts[0], TOpts[1], TOpts[2]]> {
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

    try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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

  serialize(
    input: B.Type<this>,
  ): _.Sanitized<B.Type<this>, [TOpts[0], TOpts[1], TOpts[2]]> {
    if (this.#flags.private) {
      throw new BorgError(
        `NUMBER_ERROR: Cannot serialize private number field ${input}`,
      );
    }
    return input as any;
  }

  /*TODO:
  If max is set, and min is then set to a value greater than max,
  remove max. If min is set, and max is then set to a value less than
  min, remove min.
  */
  min<const N extends number | null>(
    min: N,
  ): BorgNumber<[TOpts[0], TOpts[1], TOpts[2], [N, TOpts[3][1]]]> {
    const clone = this.copy();
    clone.#min = min;
    return clone as any;
  }

  max<const N extends number | null>(
    max: N,
  ): BorgNumber<[TOpts[0], TOpts[1], TOpts[2], [TOpts[3][0], N]]> {
    const clone = this.copy();
    clone.#max = max;
    return clone as any;
  }
  /**
   * Inclusive range
   */
  range<const Min extends number | null, const Max extends number | null>(
    min: Min,
    max: Max,
  ): BorgNumber<[TOpts[0], TOpts[1], TOpts[2], [Min, Max]]> {
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

type BooleanParams = [_.RequiredFlag, _.NullFlag, _.PrivateFlag];

type BooleanMeta<TOpts extends BooleanParams> = _.PrettyPrint<
  {
    kind: "boolean";
  } & _.GetFlags<[TOpts[0], TOpts[1], TOpts[2]]>
>;

export class BorgBoolean<const TOpts extends BooleanParams> extends Borg<
  BooleanMeta<TOpts>
> {
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };

  constructor() {
    super();
  }

  static #clone<const TBorg extends BorgBoolean<[any, any, any]>>(
    borg: TBorg,
  ): TBorg {
    const clone = new BorgBoolean();
    clone.#flags = { ...borg.#flags };
    return clone as any;
  }

  get meta(): BooleanMeta<TOpts> {
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

  parse(input: unknown): _.Parsed<boolean, [TOpts[0], TOpts[1], TOpts[2]]> {
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

    try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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

  serialize(
    input: B.Type<this>,
  ): _.Sanitized<B.Type<this>, [TOpts[0], TOpts[1], TOpts[2]]> {
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

  is(input: unknown): input is ReturnType<this["parse"]> {
    return this.try(input).ok;
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

  try(input: unknown): _.TryResult<_.Type<this>, this["meta"], _.Serialized<this>> {
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
  string: () => new BorgString(),
  number: () => new BorgNumber(),
  boolean: () => new BorgBoolean(),
  array: <const T extends Borg>(itemSchema: T) => new BorgArray(itemSchema),
  object: <const T extends { [key: string]: Borg }>(shape: T) =>
    new BorgObject(shape),
};

declare module B {
  export type Borg<
    TMeta extends { [key: string]: unknown; kind: string } = GenericMeta,
  > = InstanceType<typeof Borg<TMeta>>;
  export type Object<TOpts extends ObjectParams = ObjectParams> = InstanceType<
    typeof BorgObject<TOpts>
  >;
  export type Array<TOpts extends ArrayParams = ArrayParams> = InstanceType<
    typeof BorgArray<TOpts>
  >;
  export type String<TOpts extends StringParams = StringParams> = InstanceType<
    typeof BorgString<TOpts>
  >;
  export type Number<TOpts extends NumberParams = NumberParams> = InstanceType<
    typeof BorgNumber<TOpts>
  >;
  export type Boolean<TOpts extends BooleanParams = BooleanParams> =
    InstanceType<typeof BorgBoolean<TOpts>>;

  export type Type<TBorg extends Borg> = ReturnType<TBorg["parse"]>;
  export type Serialized<TBorg extends Borg> = ReturnType<TBorg["serialize"]>;

  export type TryResult<
    TValue = unknown,
    TSerialized = unknown,
    TMeta extends { kind: string; [key: string]: any } = {
      kind: string;
      optional: boolean;
      nullable: boolean;
      private: boolean;
      [key: string]: any;
    },
  > =
    | {
        ok: true;
        value: TValue;
        meta: TMeta;
        serialize: () => TSerialized;
      }
    | {
        ok: false;
        error: BorgError;
      };

  export type SetOptional<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, ["optional", never, never]>
  >;
  export type SetRequired<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, ["required", never, never]>
  >;
  export type SetNullable<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, [never, "nullable", never]>
  >;
  export type SetNotNull<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, [never, "notNull", never]>
  >;
  export type SetPrivate<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, [never, never, "private"]>
  >;
  export type SetPublic<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, [never, never, "public"]>
  >;
  export type SetNullish<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, ["optional", "nullable", never]>
  >;
  export type SetNotNullish<T extends B.AnyBorg> = ConstructBorgFromMeta<
    InjectFlags<ExtractParams<T>, ["required", "notNull", never]>
  >;

  export type ExtractParams<T extends B.AnyBorg> = T extends BorgObject<
    infer TParams
  >
    ? TParams
    : T extends BorgArray<infer TParams>
    ? TParams
    : T extends BorgString<infer TParams>
    ? TParams
    : T extends BorgNumber<infer TParams>
    ? TParams
    : T extends BorgBoolean<infer TParams>
    ? TParams
    : never;

  export type ConstructBorgFromMeta<
    T extends [_.RequiredFlag, _.NullFlag, _.PrivateFlag, ...any[]],
  > = T extends [T[0], T[1], T[2], infer TShape extends { [key: string]: Borg }]
    ? B.Object<[T[0], T[1], T[2], TShape]>
    : T extends [
        T[0],
        T[1],
        T[2],
        infer TMinMax extends _.MinMax,
        infer TItemSchema extends Borg,
      ]
    ? B.Array<[T[0], T[1], T[2], TMinMax, TItemSchema]>
    : T extends [
        T[0],
        T[1],
        T[2],
        infer TMinMax extends _.MinMax,
        infer TPattern extends string,
      ]
    ? B.String<[T[0], T[1], T[2], TMinMax, TPattern]>
    : T extends [T[0], T[1], T[2], infer TMinMax extends _.MinMax]
    ? B.Number<[T[0], T[1], T[2], TMinMax]>
    : T extends [T[0], T[1], T[2]]
    ? B.Boolean<[T[0], T[1], T[2]]>
    : never;

  export type AnyBorg =
    | B.Object<[any, any, any, any]>
    | B.Array<[any, any, any, any, any]>
    | B.String<[any, any, any, any, any]>
    | B.Number<[any, any, any, any]>
    | B.Boolean<[any, any, any]>;

  export type InjectFlags<
    TParams extends any[],
    TParamsToInject extends any[],
  > = [TParams, TParamsToInject] extends [
    infer _ extends [
      infer O extends _.RequiredFlag,
      infer N extends _.NullFlag,
      infer P extends _.PrivateFlag,
      ...infer Rest extends any[],
    ],
    infer __ extends [
      infer O2 extends _.RequiredFlag,
      infer N2 extends _.NullFlag,
      infer P2 extends _.PrivateFlag,
      ...infer _Rest extends any[],
    ],
  ]
    ? [
        O2 extends never ? O : O2,
        N2 extends never ? N : N2,
        P2 extends never ? P : P2,
        ...Rest,
      ]
    : never;
}

export default B;
