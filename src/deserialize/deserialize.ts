/*
These deserializer methods need to be extracted and made into a set of functions for infering the serialized type and deserializing it recursively.

// Objects

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

// Arrays

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

// Strings, Numbers, Booleans

deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    return input as any;
}

// IDs

  deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
    if (input === undefined || input === null) return input as any;
    if (this.#format) return input as any;
    return ObjectId.createFromHexString(input) as any;
  }

*/

/* import { ObjectId } from "bson";

function deserialize(input: unknown) {

}
 */

export default undefined;
