import { ObjectId, Double } from "bson";
import { BorgError } from "../../src/errors";
import {
  Borg,
  BorgArray as _BorgArray,
  BorgBoolean as _BorgBoolean,
  BorgNumber as _BorgNumber,
  BorgObject as _BorgObject,
  BorgString as _BorgString,
} from "../";
import type _B from "../";
import type _ from "../types/utils";
import type Meta from "../types/Meta";
import type { ObjectIdLike } from "bson";
import { GenericIdMeta, IdMeta } from "./BsonSchema";

type BsonType<TBorg extends { toBson: (arg0: any) => any }> = ReturnType<
  TBorg["toBson"]
>;

const isin = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
  key in obj;

abstract class BorgMongo extends Borg {
  abstract override get meta(): Meta.GenericMeta<[GenericIdMeta]>;
  abstract override try(input: unknown): _B.TryResult<this, Meta.GenericMeta<[GenericIdMeta]>>;
  abstract toBson(input: any): any;
  abstract fromBson(input: any): any;
}

class BorgArray<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TItemSchema extends BorgMongo = BorgMongo,
  >
  extends _BorgArray<TFlags, TLength, TItemSchema>
  implements BorgMongo
{
  constructor(itemSchema: TItemSchema) {
    super(itemSchema);
  }

  toBson(input: B.Type<this>): Array<BsonType<TItemSchema>> {
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.meta.borgItems.toBson(input[i]);
    }
    return result;
  }

  fromBson(input: BsonType<this>): B.Type<this> {
    if (input === null || input === undefined) return input as any;
    const result = new Array(input.length) as any;
    for (let i = 0; i < input.length; i++) {
      result[i] = this.meta.borgItems.fromBson(input[i]);
    }
    return result;
  }
}

class BorgObject<
    TFlags extends _.Flags = _.Flags,
    TShape extends { [key: string]: BorgMongo } = { [key: string]: BorgMongo },
  >
  extends _BorgObject<TFlags, TShape>
  implements BorgMongo
{
  constructor(shape: TShape) {
    super(shape);
  }

  toBson<const TInput extends Partial<B.Type<this>> = B.Type<this>>(
    input: TInput,
  ): {
    [k in keyof TShape as keyof TInput]: k extends keyof TInput
      ? TInput[k] extends undefined
        ? never
        : BsonType<TShape[k]>
      : never;
  } {
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.meta.borgShape) {
      if (!isin(input, key)) continue;
      const schema = this.meta.borgShape[key];
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

  fromBson(input: BsonType<this>): B.Type<this> {
    if (input === null || input === undefined) return input as any;
    const result = {} as any;
    for (const key in this.meta.borgShape) {
      if (!isin(input, key)) continue;
      const schema = this.meta.borgShape[key];
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
}

class BorgString<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
    TPattern extends string = '.*'
  >
  extends _BorgString<TFlags, TLength, TPattern>
  implements BorgMongo
{
  constructor() {
    super();
  }

  toBson(input: B.Type<this>) {
    return input;
  }

  fromBson(input: BsonType<this>) {
    return input;
  }
}

class BorgNumber<
    TFlags extends _.Flags = _.Flags,
    TLength extends _.MinMax = _.MinMax,
  >
  extends _BorgNumber<TFlags, TLength>
  implements BorgMongo
{
  constructor() {
    super();
  }

  toBson(input: B.Type<this>): _.Parsed<Double, TFlags> {
    return typeof input === "number" ? new Double(input) : (input as any);
  }

  fromBson(input: BsonType<this>): B.Type<this> {
    return (input && "valueOf" in input ? input.valueOf() : input) as any;
  }
}

class BorgBoolean<TFlags extends _.Flags = _.Flags>
  extends _BorgBoolean<TFlags>
  implements BorgMongo
{
  constructor() {
    super();
  }

  toBson(input: B.Type<this>): _.Parsed<boolean, TFlags> {
    return input as any;
  }

  fromBson(input: BsonType<this>): B.Type<this> {
    return input;
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

export class BorgId<
    const TFlags extends _.Flags = ["required", "notNull", "public"],
    const TFormat extends string | ObjectId = string,
  >
  extends Borg
  implements BorgMongo
{
  #flags = {
    optional: false,
    nullable: false,
    private: false,
  };
  #format = true;

  constructor() {
    super();
  }

  static #clone<const TBorg extends BorgId<any, any>>(borg: TBorg): TBorg {
    const clone = new BorgId();
    clone.#flags = { ...borg.#flags };
    clone.#format = borg.#format;
    return clone as any;
  }

  static isObjectIdLike(input: unknown): input is ObjectIdLike {
    if (typeof input !== "object" || input === null) return false;
    return (
      "toHexString" in input &&
      "id" in input &&
      typeof input.toHexString === "function" &&
      (typeof input.id === "string" || input.id instanceof Uint8Array)
    );
  }

  get meta(): IdMeta<TFlags, TFormat> {
    return Object.freeze({
      kind: "id",
      format: this.#format ? "string" : "oid",
      ...this.#flags,
    }) as any;
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

  try(input: unknown): B.TryResult<this, IdMeta<TFlags, TFormat>> {
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
          ),
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

  fromBson(input: BsonType<this>): B.Type<this> {
    if (input === undefined || input === null) return input as any;
    if (!this.#format) return input as any;
    return input.toHexString() as any;
  }

  optional(): _.SetOptional<this> {
    const clone = this.copy();
    clone.#flags.optional = true;
    return clone as any;
  }

  nullable(): _.SetNullable<this> {
    const clone = this.copy();
    clone.#flags.nullable = true;
    return clone as any;
  }

  nullish(): _.SetNullish<this> {
    const clone = this.copy();
    clone.#flags.optional = true;
    clone.#flags.nullable = true;
    return clone as any;
  }

  required(): _.SetRequired<this> {
    const clone = this.copy();
    clone.#flags.optional = false;
    return clone as any;
  }

  notNull(): _.SetNotNull<this> {
    const clone = this.copy();
    clone.#flags.nullable = false;
    return clone as any;
  }

  notNullish(): _.SetNotNullish<this> {
    const clone = this.copy();
    clone.#flags.optional = false;
    clone.#flags.nullable = false;
    return clone as any;
  }

  private(): _.SetPrivate<this> {
    const clone = this.copy();
    clone.#flags.private = true;
    return clone as any;
  }

  public(): _.SetPublic<this> {
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

const B = {
  id: () => new BorgId(),
  string: () => new BorgString(),
  number: () => new BorgNumber(),
  boolean: () => new BorgBoolean(),
  array: <const T extends BorgMongo>(itemSchema: T) =>
    new BorgArray(itemSchema),
  object: <const T extends { [key: string]: BorgMongo }>(shape: T) =>
    new BorgObject(shape),
};

declare module B {
  export type Boolean<TFlags extends _.Flags = _.Flags> = BorgBoolean<TFlags>;

  export type Id<TFlags extends _.Flags, TFormat extends string | ObjectId> = BorgId<TFlags, TFormat>;

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

  export type Borg = InstanceType<typeof BorgMongo>;

  export type Type<TBorg extends { parse: (arg0: unknown) => any }> =
    ReturnType<TBorg["parse"]>;

  export type Serialized<TBorg extends { serialize: (arg0: any) => any }> =
    ReturnType<TBorg["serialize"]>;

  export type TryResult<TBorg, TMeta extends Meta.GenericMeta<[GenericIdMeta]>> = TBorg extends infer B extends B.Borg
    ?
        | {
            ok: true;
            value: Type<B>;
            meta: TMeta;
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
    : TBorg extends BorgArray<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TItemBorg extends Borg
      >
    ? Meta.ArrayMeta<TFlags, TLength, TItemBorg>
    : TBorg extends Meta.StringMeta<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? Meta.StringMeta<TFlags, TLength, TPattern>
    : TBorg extends Meta.NumberMeta<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? Meta.NumberMeta<TFlags, TRange>
    : TBorg extends Meta.BooleanMeta<infer TFlags extends _.Flags>
    ? Meta.BooleanMeta<TFlags>
    : TBorg extends IdMeta<
        infer TFlags extends _.Flags,
        infer TFormat extends string | ObjectId
        >
    ? IdMeta<TFlags, TFormat>
    : Meta.GenericMeta<[GenericIdMeta]>

  export type AnyBorg = B.Object | B.Array | B.String | B.Number | B.Boolean;
}

export default B;

/*

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
/* 
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
  *//*
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
    */
