import B from "../";

type _SetRequired<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["required", "", ""]
>;
type _SetOptional<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["optional", "", ""]
>;
type _SetNullable<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["", "nullable", ""]
>;
type _SetNotNull<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["", "notNull", ""]
>;
type _SetPublic<TFlags extends _.Flags> = SetFLags<TFlags, ["", "", "public"]>;
type _SetPrivate<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["", "", "private"]
>;
type _SetNullish<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["optional", "nullable", ""]
>;
type _SetNotNullish<TFlags extends _.Flags> = SetFLags<
  TFlags,
  ["required", "notNull", ""]
>;

type RequiredKeys<TObj extends object> = TObj extends {
  [_ in infer K]: any;
}
  ? keyof { [k in K as undefined extends TObj[k] ? never : k]: k }
  : never;

type FlagOps = [_.Flags[0] | "", _.Flags[1] | "", _.Flags[2] | ""];
type SetFLags<TFlags extends _.Flags, TOps extends FlagOps> = [
  TOps,
  TFlags,
] extends [
  [
    infer Op_0 extends _.Flags[0] | "",
    infer Op_1 extends _.Flags[1] | "",
    infer Op_2 extends _.Flags[2] | "",
  ],
  [
    infer TFlag_0 extends _.Flags[0],
    infer TFlag_1 extends _.Flags[1],
    infer TFlag_2 extends _.Flags[2],
  ],
]
  ? [
      Op_0 extends _.Flags[0] ? Op_0 : TFlag_0,
      Op_1 extends _.Flags[1] ? Op_1 : TFlag_1,
      Op_2 extends _.Flags[2] ? Op_2 : TFlag_2,
    ]
  : never;

declare module _ {
  type RequiredKeysArray<TShape extends object> =
    TShape extends infer T extends { [key: string]: B.Borg }
      ? Array<
          RequiredKeys<{
            [k in keyof T]: B.Type<T[k]>;
          }>
        >
      : Array<
          RequiredKeys<TShape>
      >;

  type PrettyPrint<T> = T extends infer U extends object
    ? { [K in keyof U]: U[K] }
    : T;

  type RequiredFlag = "required" | "optional";
  type NullFlag = "notNull" | "nullable";
  type PrivateFlag = "public" | "private";
    
  type Flags = [RequiredFlag, NullFlag, PrivateFlag];
  type MinMax = [number | null, number | null];

  type Parsed<TType, TFlags extends Flags> = [TFlags[0], TFlags[1]] extends [
    infer TOptional extends Flags[0],
    infer TNullable extends Flags[1],
  ]
    ?
        | TType
        | (TNullable extends "nullable" ? null : never)
        | (TOptional extends "optional" ? undefined : never)
    : never;

  type Sanitized<TType, TFlags extends Flags> = TFlags extends [
    infer TOptional extends Flags[0],
    infer TNullable extends Flags[1],
    infer TPublic extends Flags[2],
  ]
    ? TPublic extends "private"
      ? never
      : Parsed<TType, [TOptional, TNullable, "public"]>
    : never;

  type GetFlags<
    TFlags extends Flags,
    TFormat extends "enum" | "bool" = "bool",
  > = TFlags extends [infer TOptional, infer TNullable, infer TPrivate]
    ? {
        optional: TOptional extends "optional"
          ? TFormat extends "enum"
            ? "optional"
            : true
          : TFormat extends "enum"
          ? "required"
          : false;
        nullable: TNullable extends "nullable"
          ? TFormat extends "enum"
            ? "nullable"
            : true
          : TFormat extends "enum"
          ? "notNull"
          : false;
        private: TPrivate extends "private"
          ? TFormat extends "enum"
            ? "private"
            : true
          : TFormat extends "enum"
          ? "public"
          : false;
      }
    : never;

/* 
    type ExtractFlags<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags
  >
    ? TFlags
    : TBorg extends B.Array<infer TFlags extends _.Flags>
    ? TFlags
    : TBorg extends B.String<infer TFlags extends _.Flags>
    ? TFlags
    : TBorg extends B.Number<infer TFlags extends _.Flags>
    ? TFlags
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? TFlags
    : never;
  
  type SetNotNull<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetNotNull<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetNotNull<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetNotNull<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetNotNull<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetNotNull<TFlags>>
    : never;
  
  type SetNullable<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetNullable<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetNullable<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetNullable<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetNullable<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetNullable<TFlags>>
    : never;
  
  type SetNullish<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetNullish<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetNullish<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetNullish<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetNullish<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetNullish<TFlags>>
    : never;
  
  type SetNotNullish<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetNotNullish<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetNotNullish<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetNotNullish<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetNotNullish<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetNotNullish<TFlags>>
    : never;
  
  type SetRequired<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetRequired<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetRequired<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetRequired<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetRequired<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetRequired<TFlags>>
    : never;
  
  type SetOptional<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetOptional<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetOptional<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetOptional<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetOptional<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetOptional<TFlags>>
    : never;
  
  type SetPublic<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetPublic<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetPublic<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetPublic<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetPublic<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetPublic<TFlags>>
    : never;
  
  type SetPrivate<TBorg extends B.Borg> = TBorg extends B.Object<
    infer TFlags extends _.Flags,
    infer TShape extends { [key: string]: B.Borg }
  >
    ? B.Object<_SetPrivate<TFlags>, TShape>
    : TBorg extends B.Array<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TShape extends B.Borg
      >
    ? B.Array<_SetPrivate<TFlags>, TLength, TShape>
    : TBorg extends B.String<
        infer TFlags extends _.Flags,
        infer TLength extends _.MinMax,
        infer TPattern extends string
      >
    ? B.String<_SetPrivate<TFlags>, TLength, TPattern>
    : TBorg extends B.Number<
        infer TFlags extends _.Flags,
        infer TRange extends _.MinMax
      >
    ? B.Number<_SetPrivate<TFlags>, TRange>
    : TBorg extends B.Boolean<infer TFlags extends _.Flags>
    ? B.Boolean<_SetPrivate<TFlags>>
    : never;
*/
}

export default _;
