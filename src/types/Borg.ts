import { Meta } from "./Meta";

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
  abstract get meta(): Meta;
  abstract get bsonSchema(): any;
  abstract copy(): Borg;
  abstract parse(input: unknown): any;
  abstract serialize(input: any): any;
  abstract deserialize(input: any): any;
  abstract toBson(input: any): any;
  abstract fromBson(input: any): any;
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

export type BorgModel<
  TInputSchema extends Borg,
  TServerModel = Type<TInputSchema>,
  TOutputSchema extends Borg = TInputSchema,
> = {
  createFromRequest: (input: Type<TInputSchema>) => Type<TOutputSchema>;
  sanitizeResponse: (input: TServerModel) => Type<TOutputSchema>;
  serializeInput: (parsedInput: Type<TInputSchema>) => Serialized<TInputSchema>;
  deserializeInput: (
    serializedInput: Serialized<TInputSchema>,
  ) => Type<TInputSchema>;
  serializeOutput: (
    parsedOutput: Type<TOutputSchema>,
  ) => Serialized<TOutputSchema>;
  deserializeOutput: (
    serializedOutput: Serialized<TOutputSchema>,
  ) => Type<TOutputSchema>;
  parseInput: (input: unknown) => Type<TInputSchema>;
  parseOutput: (input: unknown) => Type<TOutputSchema>;
};

export type Type<TBorg extends { parse: (arg0: unknown) => any }> = ReturnType<
  TBorg["parse"]
>;
export type BsonType<TBorg extends { toBson: (arg0: any) => any }> = ReturnType<
  TBorg["toBson"]
>;
export type Serialized<TBorg extends { serialize: (arg0: any) => any }> =
  ReturnType<TBorg["serialize"]>;
export type Deserialized<TBorg extends { deserialize: (arg0: any) => any }> =
  ReturnType<TBorg["deserialize"]>;
