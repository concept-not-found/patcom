import TimeJumpIterator from '../time-jump-iterator.js'
import { mapMatcher, mapResultMatcher } from '../mappers.js'

export const unmatched = {
  matched: false,
}

export const matcher = Symbol('matcher')
export const Matcher = (fn) => {
  fn[matcher] = fn
  return fn
}

export const iteratorMatcher = Symbol('iterator matcher')
export const IteratorMatcher = (fn) => {
  fn[iteratorMatcher] = fn
  return fn
}

export const asMatcher = (matchable) => {
  if (matchable === undefined) {
    return any
  }
  if (matchable[matcher]) {
    return matchable[matcher]
  }
  if (matchable[iteratorMatcher]) {
    return matchable[iteratorMatcher]
  }
  if (Array.isArray(matchable)) {
    return matchArray(matchable)
  }
  if (matchable instanceof RegExp) {
    return matchRegExp(matchable)
  }
  if (matchable instanceof String) {
    return matchString(matchable)
  }
  switch (typeof matchable) {
    case 'boolean':
      return matchBoolean(matchable)
    case 'number':
      return matchNumber(matchable)
    case 'string':
      return matchString(matchable)
    case 'object':
      return matchObject(matchable)
  }
  if (typeof matchable !== 'function') {
    throw new Error(`unable to create matcher from ${matchable}`)
  }
  return matchable
}

export const maybe = (expected) =>
  IteratorMatcher((iterator) => {
    const time = iterator.now
    const matcher = asMatcher(expected)
    let result
    if (matcher[iteratorMatcher]) {
      result = matcher(iterator)
    } else {
      const { value, done } = iterator.next()
      if (done) {
        iterator.jump(time)
        return {
          matched: true,
          value: [],
        }
      }
      result = matcher(value)
    }
    if (result.matched) {
      if (matcher[iteratorMatcher]) {
        return {
          matched: true,
          value: result.value,
          result,
        }
      } else {
        return {
          matched: true,
          value: [result.value],
          result,
        }
      }
    } else {
      iterator.jump(time)
      return {
        matched: true,
        value: [],
      }
    }
  })

export const group = (...expected) =>
  IteratorMatcher((iterator) => {
    const values = []
    const results = []
    for (const element of expected) {
      const matcher = asMatcher(element)
      let result
      if (matcher[iteratorMatcher]) {
        result = matcher(iterator)
      } else {
        const { value, done } = iterator.next()
        if (done) {
          return unmatched
        }
        result = matcher(value)
      }
      if (result.matched) {
        if (matcher[iteratorMatcher]) {
          values.push(...result.value)
        } else {
          values.push(result.value)
        }
        results.push(result)
      } else {
        return unmatched
      }
    }
    return {
      matched: true,
      value: values,
      result: results,
    }
  })

export const some = (expected) =>
  IteratorMatcher((iterator) => {
    const values = []
    const results = []
    const matcher = asMatcher(expected)
    if (matcher[iteratorMatcher]) {
      while (true) {
        const time = iterator.now
        const result = matcher(iterator)
        if (result.matched) {
          if (result.value.length === 0) {
            throw new Error(
              'some will infinite loop if expected matches but consumes no elements. some of maybe is not possible'
            )
          }
          values.push(...result.value)
          results.push(result)
        } else {
          if (results.length === 0) {
            return unmatched
          }
          iterator.jump(time)
          return {
            matched: true,
            value: values,
            result: results,
          }
        }
      }
    } else {
      while (true) {
        const time = iterator.now
        const { value, done } = iterator.next()
        if (done) {
          if (results.length === 0) {
            return unmatched
          } else {
            iterator.jump(time)
            return {
              matched: true,
              value: values,
              result: results,
            }
          }
        }
        const result = matcher(value)
        if (result.matched) {
          values.push(result.value)
          results.push(result)
        } else {
          if (results.length === 0) {
            return unmatched
          }
          iterator.jump(time)
          return {
            matched: true,
            value: values,
            result: results,
          }
        }
      }
    }
  })

export const rest = IteratorMatcher((iterator) => {
  return {
    matched: true,
    value: [...iterator],
  }
})

export const matchArray = (expected) =>
  Matcher((value) => {
    const valueIsANumberBooleanStringOrFunction = typeof value !== 'object'
    if (
      value === undefined ||
      !value[Symbol.iterator] ||
      valueIsANumberBooleanStringOrFunction
    ) {
      return unmatched
    }
    if (expected === undefined) {
      if (!Array.isArray(value)) {
        value = [...value]
      }
      return {
        matched: true,
        value,
        result: [],
      }
    }
    const iterator = TimeJumpIterator(value[Symbol.iterator]())
    const readValues = []
    const results = []
    for (const element of expected) {
      const matcher = asMatcher(element)
      if (matcher[iteratorMatcher]) {
        const result = matcher(iterator)
        if (result.matched) {
          results.push(result)
          readValues.push(...result.value)
          continue
        }
        return unmatched
      } else {
        const { value: iteratorValue, done } = iterator.next()
        if (done) {
          return unmatched
        }
        const result = matcher(iteratorValue)
        if (result.matched) {
          results.push(result)
          readValues.push(iteratorValue)
          continue
        }
        return unmatched
      }
    }
    if (iterator.next().done) {
      return {
        matched: true,
        value: readValues,
        result: results,
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
          result: {},
        }
      } else {
        return unmatched
      }
    }
    let restKey
    const results = {}
    const matchedByKey = {}
    const unmatchedKeys = []
    for (const key in expected) {
      const matcher = asMatcher(expected[key])
      if (matcher === rest) {
        restKey = key
        continue
      }

      if (key in value) {
        results[key] = matcher(value[key])
      }
      if (!results?.[key]?.matched ?? false) {
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
      results[restKey] = { matched: true, value: restValue }
    }
    return {
      matched: true,
      value,
      result: results,
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

export const matchString = (expected) =>
  matchPredicate(
    (value) =>
      (expected === undefined &&
        (typeof value === 'string' || value instanceof String)) ||
      String(expected) === String(value)
  )

export const any = matchPredicate(() => true)

export const defined = matchPredicate((value) => value !== undefined)

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

export const not = (matchable) =>
  Matcher((value) => {
    const matcher = asMatcher(matchable)
    const result = matcher(value)
    if (!result.matched) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
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
    const results = []
    for (const matchable of matchables) {
      const matcher = asMatcher(matchable)
      const result = matcher(value)
      results.push(result)
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
      result: results,
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
