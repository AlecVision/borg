/**
 * @object
 * ```
 * function deserialize(
 *     input: B.Serialized<this>,
 *   ): _.Sanitized<{ [k in keyof TShape]: B.Deserialized<TShape[k]> }, TFlags> {
 *     if (input === null || input === undefined) return input as any;
 *     const result = {} as any;
 *     for (const key in this.#shape) {
 *       if (!isin(input, key)) continue;
 *       const schema = this.#shape[key];
 *       if (schema === undefined) {
 *         throw new BorgError(
 *           `SCHEMA_ERROR(deserialize): Invalid schema for key "${key}": got undefined`,
 *           undefined,
 *           [key],
 *         );
 *       }
 *       result[key] = schema.deserialize(input[key]);
 *     }
 *     return result;
 *   }
 * ```
 * @array
 * ```
 * deserialize(
 *   input: B.Serialized<this>,
 * ): _.Sanitized<Array<B.Deserialized<TItemSchema>>, TFlags> {
 *   if (input === null || input === undefined) return input as any;
 *   const result = new Array(input.length) as any;
 *   for (let i = 0; i < input.length; i++) {
 *     result[i] = this.#itemSchema.deserialize(input[i]);
 *   }
 *   return result;
 * }
 * ```
 * @boolean
 * ```
 * deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
 *     return input as any;
 * }
 * ```
 *
 * @number
 * ```
 * deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
 *    return input as any;
 * }
 * ```
 *
 * @string
 * ```
 * deserialize(input: B.Serialized<this>): _.Sanitized<B.Type<this>, TFlags> {
 *    return input as any;
 * }
 *
 */
