import { mapMatcher, mapResultMatcher } from '../mappers.js'

export const matcher = Symbol('matcher')

export const unmatched = {
  matched: false,
}

export const Matcher = (fn) => {
  fn[matcher] = fn
  return fn
}

export const asMatcher = (matchable) => {
  if (matchable === undefined) {
    return any
  }
  if (matchable[matcher]) {
    return matchable[matcher]
  }
  if (Array.isArray(matchable)) {
    return matchArray(matchable)
  }
  if (matchable instanceof RegExp) {
    return matchRegExp(matchable)
  }
  switch (typeof matchable) {
    case 'boolean':
    case 'number':
    case 'string':
      return equals(matchable)
    case 'object':
      return matchObject(matchable)
  }
  if (typeof matchable !== 'function') {
    throw new Error(`unable to create matcher from ${matchable}`)
  }
  return matchable
}

export const matchArray = (expected) =>
  Matcher((value) => {
    if (value === undefined || !value[Symbol.iterator]) {
      return unmatched
    }
    if (expected === undefined) {
      if (!Array.isArray(value)) {
        value = [...value]
      }
      return {
        matched: true,
        value,
      }
    }
    const iterator = value[Symbol.iterator]()
    const readValues = []
    for (const element of expected) {
      const matcher = asMatcher(element)
      if (matcher === rest) {
        const restValues = [...iterator]
        if (!Array.isArray(value)) {
          value = [...readValues, ...restValues]
        }
        return {
          matched: true,
          value,
          rest: restValues,
        }
      }
      const { value: iteratorValue, done } = iterator.next()
      if (done) {
        return unmatched
      }
      readValues.push(iteratorValue)
      if (matcher(iteratorValue).matched) {
        continue
      }
      return unmatched
    }
    if (iterator.next().done) {
      return {
        matched: true,
        value: readValues,
      }
    } else {
      return unmatched
    }
  })

export const matchObject = (expected) =>
  Matcher((value) => {
    if (expected === undefined) {
      if (typeof value === 'object') {
        return {
          matched: true,
          value,
        }
      } else {
        return unmatched
      }
    }
    let restKey
    const matchedByKey = {}
    const unmatchedKeys = []
    for (const key in expected) {
      const matcher = asMatcher(expected[key])
      if (matcher === rest) {
        restKey = key
        continue
      }
      if (!(key in value) || !matcher(value[key]).matched) {
        unmatchedKeys.push(key)
        continue
      }
      matchedByKey[key] = true
    }
    const restValue = {}
    for (const key in value) {
      if (matchedByKey[key]) {
        continue
      }
      if (restKey) {
        restValue[key] = value[key]
      } else {
        unmatchedKeys.push(key)
      }
    }
    if (unmatchedKeys.length !== 0) {
      unmatchedKeys.sort()
      return {
        matched: false,
        expectedKeys: Object.keys(expected).sort(),
        restKey,
        matchedKeys: Object.keys(matchedByKey).sort(),
        unmatchedKeys,
      }
    }
    if (restKey) {
      return {
        matched: true,
        value,
        rest: restValue,
      }
    }
    return {
      matched: true,
      value,
    }
  })

export const matchPredicate = (predicate) =>
  Matcher((value) =>
    predicate(value)
      ? {
          matched: true,
          value,
        }
      : unmatched
  )

export const equals = (expected) =>
  matchPredicate((value) => expected === undefined || expected === value)

export const matchBoolean = (expected) =>
  matchPredicate(
    (value) =>
      (expected === undefined && typeof value === 'boolean') ||
      expected === value
  )

export const matchNumber = (expected) =>
  matchPredicate(
    (value) =>
      (expected === undefined && typeof value === 'number') ||
      expected === value
  )

export const matchBigInt = (expected) =>
  matchPredicate(
    (value) =>
      (expected === undefined && typeof value === 'bigint') ||
      expected === value
  )

export const nonEmptyString = matchPredicate(
  (value) => typeof value === 'string' || value instanceof String
)

export const matchString = (expected) =>
  matchPredicate(
    (value) =>
      (expected === undefined && typeof value === 'string') ||
      value instanceof String ||
      expected === value
  )

export const any = matchPredicate(() => true)

export const defined = matchPredicate((value) => value !== undefined)

export const rest = Matcher(() => {
  throw new Error(
    'rest is a marker matcher and does actually match anything. it is intended to used within matchArray and matchObject'
  )
})

export const between = (lower, upper) =>
  matchPredicate(
    (value) => typeof value === 'number' && lower <= value && value < upper
  )

export const greaterThan = (expected) =>
  matchPredicate((value) => typeof value === 'number' && expected < value)

export const greaterThanEquals = (expected) =>
  matchPredicate((value) => typeof value === 'number' && expected <= value)

export const lessThan = (expected) =>
  matchPredicate((value) => typeof value === 'number' && expected > value)

export const lessThanEquals = (expected) =>
  matchPredicate((value) => typeof value === 'number' && expected >= value)

export const matchRegExp = (expected) =>
  Matcher((value) => {
    if (typeof value === 'string' || value instanceof String) {
      const matchedRegExp = value.match(expected)
      if (matchedRegExp) {
        return {
          matched: true,
          value: value,
          matchedRegExp,
        }
      }
      return {
        matched: false,
        expected,
        matchedRegExp,
      }
    }
    return {
      matched: false,
      expected,
      typeofValue: typeof value,
    }
  })

export const oneOf = (...matchables) =>
  Matcher((value) => {
    for (const matchable of matchables) {
      const matcher = asMatcher(matchable)
      const result = matcher(value)
      if (result.matched) {
        return result
      }
    }
    return unmatched
  })

export const allOf = (...matchables) =>
  Matcher((value) => {
    for (const matchable of matchables) {
      const matcher = asMatcher(matchable)
      const result = matcher(value)
      if (!result.matched) {
        return {
          matched: false,
          expected: matchables,
          failed: result,
        }
      }
    }

    return {
      matched: true,
      value,
    }
  })

export const matchProp = (expected) =>
  matchPredicate((value) => expected in value)

export const empty = matchPredicate(
  (value) =>
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    Object.keys(value).length === 0
)

export const when = (matchable, ...valueMappers) => {
  const matcher = asMatcher(matchable)
  if (valueMappers.length === 0) {
    return matcher
  }

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

export const otherwise = (...mapperables) => when(any, ...mapperables)
