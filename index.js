import { oneOf } from './matchers/index.js'
export * from './matchers/index.js'
export * from './mappers.js'

export const match =
  (value) =>
  (...matchers) => {
    const result = oneOf(...matchers)(value)
    return result.value
  }
