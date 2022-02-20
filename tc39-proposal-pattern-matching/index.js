import {
  any,
  oneOf,
  mapMatchedMatcher,
  asMatchedMapper,
  fromMatchable,
  unmatched,
  mapResultMatcher,
} from '../index.js'

export function when(matchable, ...mapperables) {
  const matcher = fromMatchable(matchable)
  const matchedMappers = mapperables.map(asMatchedMapper)

  const guards = matchedMappers.slice(0, -1)
  const guardMatcher = mapResultMatcher((result) => {
    if (result.matched) {
      const allGuardsPassed = guards.every((guard) => guard(result).value)
      if (allGuardsPassed) {
        return result
      }
    }
    return unmatched
  })(matcher)

  const matchedMapper = matchedMappers[matchedMappers.length - 1]
  return mapMatchedMatcher(matchedMapper)(guardMatcher)
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
