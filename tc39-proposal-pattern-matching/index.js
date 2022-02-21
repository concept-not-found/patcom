import {
  any,
  oneOf,
  mapMatcher,
  fromMatchable,
  unmatched,
  mapResultMatcher,
} from '../index.js'

export function when(matchable, ...valueMappers) {
  const matcher = fromMatchable(matchable)

  const guards = valueMappers.slice(0, -1)
  const guardMatcher = mapResultMatcher((result) => {
    if (result.matched) {
      const allGuardsPassed = guards.every((guard) =>
        guard(result.value, result)
      )
      if (allGuardsPassed) {
        return result
      }
    }
    return unmatched
  })(matcher)

  const valueMapper = valueMappers[valueMappers.length - 1]
  return mapMatcher(valueMapper)(guardMatcher)
}

export function otherwise(...mapperables) {
  return when(any, ...mapperables)
}

export const match =
  (value) =>
  (...clauses) => {
    const result = oneOf(...clauses)(value)
    return result.value
  }
