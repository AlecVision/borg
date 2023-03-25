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
        borgShape: { [key: string]: Borg };
      }
    | {
        borgItems: Borg;
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
  borgShape: TShape;
} & GetFlags<TFlags>>;

export type ArrayMeta<
  TFlags extends Flags,
  TLength extends MinMax,
  TItemBorg extends B.AnyBorg,
> = PrettyPrint<{
  borgItems: TItemBorg;
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

export type NumberMeta<
  TFlags extends Flags,
  TRange extends MinMax,
> = PrettyPrint<{
  kind: "number";
  max: TRange[1];
  min: TRange[0];
} & GetFlags<TFlags>>;

export type IdMeta<
  TFlags extends Flags,
  TFormat extends string | ObjectId,
> = PrettyPrint<{
  kind: "id";
  format: TFormat extends ObjectId ? "oid" : "string";
} & GetFlags<TFlags>>;

export type BooleanMeta<TFlags extends Flags> = PrettyPrint<{
  kind: "boolean";
} & GetFlags<TFlags>>;

export type MetaFromBorg<TBorg extends Borg> = TBorg extends ObjectMeta<
  infer TFlags,
  infer TShape
>
  ? ObjectMeta<TFlags, TShape>
  : TBorg extends ArrayMeta<infer TItemBorg, infer TFlags, infer TLength>
  ? ArrayMeta<TItemBorg, TFlags, TLength>
  : TBorg extends StringMeta<infer TFlags, infer TLength, infer TPattern>
  ? StringMeta<TFlags, TLength, TPattern>
  : TBorg extends NumberMeta<infer TFlags, infer TRange>
  ? NumberMeta<TFlags, TRange>
  : TBorg extends IdMeta<infer TFlags, infer TFormat>
  ? IdMeta<TFlags, TFormat>
  : TBorg extends BooleanMeta<infer TFlags>
  ? BooleanMeta<TFlags>
  : Meta
