import * as _ from "./types";

export class BorgData<TData, TMeta extends _.Meta> {
  #data: TData;
  #meta: TMeta;

  constructor(data: TData, meta: TMeta) {
    this.#data = data;
    this.#meta = meta;
  }

  toJSON() {
    if (this.#meta.toJSON) {
      return this.#meta.toJSON(this.#data);
    }

    return this.#data;
  }

  toString() {}
  valueOf() {}

  [Symbol.toPrimitive]() {}

  [Symbol.iterator]() {}

  [Symbol.asyncIterator]() {}

  [Symbol.toStringTag]() {}

  [Symbol.hasInstance]() {}

  [Symbol.isConcatSpreadable]() {}

  [Symbol.match]() {}

  [Symbol.matchAll]() {}

  [Symbol.replace]() {}

  [Symbol.search]() {}

  [Symbol.split]() {}

  [Symbol.species]() {}
}
