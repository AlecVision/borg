import _ from "./utils";
import B from "../";

declare module Meta {
  type ObjectMeta<
    TFlags extends _.Flags,
    TShape extends { [key: string]: B.Borg },
  > = _.PrettyPrint<
    {
      kind: "object";
      keys: Array<Extract<keyof TShape, string>>;
      requiredKeys: _.RequiredKeysArray<TShape>;
      borgShape: TShape;
    } & _.GetFlags<TFlags>
  >;

  type ArrayMeta<
    TFlags extends _.Flags,
    TLength extends _.MinMax,
    TItemBorg extends B.Borg,
  > = _.PrettyPrint<
    {
      borgItems: TItemBorg;
      kind: "array";
      maxItems: TLength[1];
      minItems: TLength[0];
    } & _.GetFlags<TFlags>
  >;

  type StringMeta<
    TFlags extends _.Flags,
    TLength extends _.MinMax,
    TPattern extends string,
  > = _.PrettyPrint<
    {
      kind: "string";
      maxLength: TLength[1];
      minLength: TLength[0];
      pattern: TPattern;
      regex: TPattern extends ".*" ? undefined : RegExp;
    } & _.GetFlags<TFlags>
  >;

  type NumberMeta<TFlags extends _.Flags, TRange extends _.MinMax> = _.PrettyPrint<
    {
      kind: "number";
      max: TRange[1];
      min: TRange[0];
    } & _.GetFlags<TFlags>
  >;

  type BooleanMeta<TFlags extends _.Flags> = _.PrettyPrint<
    {
      kind: "boolean";
    } & _.GetFlags<TFlags>
  >;
  /* 

  type GenericMeta<TExtension extends {[key: string]: any}[] = {[key: string]: any}[]> = _.PrettyPrint<
    {
      optional: boolean;
      nullable: boolean;
      private: boolean;
    } & (
      | {
          kind: "object";
          keys: (string | undefined)[];
          requiredKeys: (string | undefined)[];
          borgShape: { [key: string]: B.Borg };
        }
      | {
          borgItems: B.Borg;
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
      | TExtension[number]
    )
  >;
} */
}

export default Meta;
