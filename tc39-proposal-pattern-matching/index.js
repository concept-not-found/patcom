import { asMatchedMapper, fromMatchable, unmatched } from '../index.js'

export function when(matchable, mapperable) {
  const matcher = fromMatchable(matchable)
  const whenMatcher = matcher
  whenMatcher.onMatch = asMatchedMapper(mapperable)
  return whenMatcher
}

export function otherwise(mapperable) {
  const otherwiseMatcher = (value) => {
    return {
      matched: true,
      value,
    }
  }
  otherwiseMatcher.onMatch = asMatchedMapper(mapperable)
  return otherwiseMatcher
}

export function guard(matchable, predicate) {
  const matcher = fromMatchable(matchable)
  return (value) => {
    const result = matcher(value)
    if (result.matched && predicate(result.value)) {
      return result
    }
    return unmatched
  }
}

export const match =
  (value) =>
  (...clauses) => {
    for (const clause of clauses) {
      const result = clause(value)
      if (result.matched) {
        return clause.onMatch(result).value
      }
    }
    return
  }
