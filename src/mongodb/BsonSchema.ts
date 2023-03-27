import { ObjectId } from "bson";
import _ from "../types/utils";
import Meta from "../types/Meta";
import type B from ".";


export type GenericIdMeta = {
  kind: "id";
  format: "oid" | "string";
}

export type IdMeta<
  TFlags extends _.Flags,
  TFormat extends string | ObjectId,
> = _.PrettyPrint<
  {
    kind: "id";
    format: TFormat extends ObjectId ? "oid" : "string";
  } & _.GetFlags<TFlags>
>;

type BsonSchema<TMeta extends Meta.GenericMeta<[GenericIdMeta]>> = _.PrettyPrint<
  TMeta extends Meta.ObjectMeta<infer TFlags extends _.Flags, infer _ extends {[key in infer TKeys]: infer TBorg extends B.Borg}>
    ? ObjectBsonSchema<Meta.ObjectMeta<TFlags, {[key in TKeys]: TBorg}>>
    : TMeta extends Meta.ArrayMeta<infer TFlags extends _.Flags, infer TMinMax extends _.MinMax, infer TItems>
    ? ArrayBsonSchema<Meta.ArrayMeta<TFlags, TMinMax, TItems>>
    : TMeta extends IdMeta<infer TFlags extends _.Flags, infer TFormat extends string | ObjectId>
    ? IdBsonSchema<IdMeta<TFlags, TFormat>>
    : TMeta extends Meta.NumberMeta<infer TFlags extends _.Flags, infer TMinMax extends _.MinMax>
    ? NumberBsonSchema<Meta.NumberMeta<TFlags, TMinMax>>
    : TMeta extends Meta.StringMeta<infer TFlags extends _.Flags, infer TMinMax extends _.MinMax, infer TPattern extends string>
    ? StringBsonSchema<Meta.StringMeta<TFlags, TMinMax, TPattern>>
    : TMeta extends Meta.BooleanMeta<infer TFlags extends _.Flags>
    ? BooleanBsonSchema<Meta.BooleanMeta<TFlags>>
    : never
>;

type IdBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "id" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["objectId", "null"] : "objectId";
};

type ObjectBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "object" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["object", "null"] : "object";
  required: TMeta["requiredKeys"];
  properties: {
    [k in keyof TMeta["borgShape"]]: TMeta["borgShape"][k]["bsonSchema"];
  };
};

type ArrayBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "array" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["array", "null"] : "array";
  items: TMeta["borgItems"]["bsonSchema"];
} & (TMeta["minItems"] extends number ? { minItems: TMeta["minItems"] } : {}) &
  (TMeta["maxItems"] extends number ? { maxItems: TMeta["maxItems"] } : {});

type NumberBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "number" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["number", "null"] : "number";
} & (TMeta["min"] extends number ? { minimum: TMeta["min"] } : {}) &
  (TMeta["max"] extends number ? { maximum: TMeta["max"] } : {});

type StringBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "string" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["string", "null"] : "string";
} & (TMeta["minLength"] extends number
  ? { minLength: TMeta["minLength"] }
  : {}) &
  (TMeta["maxLength"] extends number ? { maxLength: TMeta["maxLength"] } : {}) &
  (TMeta["pattern"] extends ".*" ? {} : { pattern: TMeta["pattern"] });

type BooleanBsonSchema<TMeta extends Extract<Meta.GenericMeta<[GenericIdMeta]>, { kind: "boolean" }>> = {
  bsonType: TMeta["nullable"] extends true ? ["bool", "null"] : "bool";
};

export function getBsonSchema<const TBorg extends B.Borg>(
  borg: TBorg,
): BsonSchema<B.MetaFromBorg<TBorg>> {
  const meta = borg.meta;
  switch (meta.kind) {
    case "string": {
      const { minLength: min, maxLength: max, nullable, regex } = meta;
      return Object.freeze({
        bsonType: nullable ? Object.freeze(["string", "null"]) : "string",
        ...(min !== null ? { minLength: min } : {}),
        ...(max !== null ? { maxLength: max } : {}),
        ...(regex ? { pattern: regex.source } : {}),
      }) as any;
    }
    case "number": {
      const { min, max, nullable } = meta;
      return {
        bsonType: nullable ? Object.freeze(["double", "null"]) : "double",
        ...(min !== null ? { minimum: min } : {}),
        ...(max !== null ? { maximum: max } : {}),
      } as any;
    }
    case "array": {
      const { minItems, maxItems, nullable, borgItems: itemsBorg } = meta;
      return {
        bsonType: nullable ? Object.freeze(["array", "null"]) : "array",
        items: itemsBorg.bsonSchema,
        ...(minItems !== null ? { minItems } : {}),
        ...(maxItems !== null ? { maxItems } : {}),
      } as any;
    }
    case "object": {
      const { nullable, borgShape: shape, requiredKeys } = meta;
      return {
        bsonType: nullable ? Object.freeze(["object", "null"]) : "object",
        required: Object.freeze([...requiredKeys]),
        properties: Object.fromEntries(
          Object.entries(shape).map(([key, value]) => [key, value.bsonSchema]),
        ),
      } as any;
    }
    case "boolean": {
      const { nullable } = meta;
      return {
        bsonType: nullable ? Object.freeze(["bool", "null"]) : "bool",
      } as any;
    }
    case "id": {
      const { nullable } = meta;
      return {
        bsonType: nullable ? Object.freeze(["objectId", "null"]) : "objectId",
      } as any;
    }
    default: {
      throw new Error("unreachable");
    }
  }
}
