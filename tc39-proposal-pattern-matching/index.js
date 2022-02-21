import { oneOf } from '../index.js'

export const match =
  (value) =>
  (...clauses) => {
    const result = oneOf(...clauses)(value)
    return result.value
  }
