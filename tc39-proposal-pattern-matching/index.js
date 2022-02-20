import {
  any,
  oneOf,
  mapMatchedMatcher,
  asMatchedMapper,
  fromMatchable,
  mapMatcher,
  unmatched,
} from '../index.js'

export function when(matchable, mapperable) {
  const matcher = fromMatchable(matchable)
  const matchedMapper = asMatchedMapper(mapperable)
  return mapMatchedMatcher(matchedMapper)(matcher)
}

export function otherwise(mapperable) {
  const matchedMapper = asMatchedMapper(mapperable)
  return mapMatchedMatcher(matchedMapper)(any)
}

export function guard(matchable, predicate) {
  const matcher = fromMatchable(matchable)
  const predicateMatcher = mapMatcher(predicate)(matcher)
  return (value) => {
    const result = predicateMatcher(value)
    if (result.matched && result.value) {
      return result
    }
    return unmatched
  }
}

export const match =
  (value) =>
  (...clauses) => {
    const result = oneOf(...clauses)(value)
    return result.value
  }
