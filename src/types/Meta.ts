import { ObjectId } from "bson";
import {
  Flags,
  GetFlags,
  MinMax,
  Borg,
  RequiredKeysArray,
  PrettyPrint,
} from ".";

export type Meta = PrettyPrint<
  {
    optional: boolean;
    nullable: boolean;
    private: boolean;
  } & (
    | {
        kind: "object";
        keys: (string | undefined)[];
        requiredKeys: (string | undefined)[];
        shape: { [key: string]: Borg };
      }
    | {
        itemsBorg: Borg;
        kind: "array";
        maxItems: number | null;
        minItems: number | null;
      }
    | {
        kind: "string";
        maxLength: number | null;
        minLength: number | null;
        pattern: string | undefined;
        regex: RegExp | undefined;
      }
    | {
        kind: "number";
        max: number | null;
        min: number | null;
      }
    | {
        kind: "boolean";
      }
    | {
        kind: "id";
        format: "string" | "oid";
      }
  )
>;

export type ObjectMeta<
  TFlags extends Flags,
  TShape extends { [key: string]: Borg },
> = PrettyPrint<{
  kind: "object";
  keys: Array<Extract<keyof TShape, string>>;
  requiredKeys: RequiredKeysArray<TShape>;
  shape: TShape;
} & GetFlags<TFlags>>;

export type ArrayMeta<
  TItemBorg extends Borg,
  TFlags extends Flags,
  TLength extends MinMax,
> = PrettyPrint<{
  itemsBorg: TItemBorg;
  kind: "array";
  maxItems: TLength[1];
  minItems: TLength[0];
} & GetFlags<TFlags>>;

export type StringMeta<
  TFlags extends Flags,
  TLength extends MinMax,
  TPattern extends string,
> = PrettyPrint<{
  kind: "string";
  maxLength: TLength[1];
  minLength: TLength[0];
  pattern: TPattern;
  regex: TPattern extends ".*" ? undefined : RegExp;
} & GetFlags<TFlags>>;

export type NumberMeta<TFlags extends Flags, TRange extends MinMax> = PrettyPrint<{
  kind: "number";
  max: TRange[1];
  min: TRange[0];
} & GetFlags<TFlags>>;

export type IdMeta<TFlags extends Flags, TFormat extends string | ObjectId> = PrettyPrint<{
  kind: "id";
  format: TFormat extends ObjectId ? "oid" : "string";
} & GetFlags<TFlags>>;

export type BooleanMeta<TFlags extends Flags> = PrettyPrint<{
  kind: "boolean";
} & GetFlags<TFlags>>;
