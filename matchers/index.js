import TimeJumpIterator from '../time-jump-iterator.js'
import { mapMatcher, mapResultMatcher } from '../mappers.js'

export const unmatched = {
  matched: false,
}

const internalIterator = Symbol('internal iterator')

export const matcher = Symbol('matcher')
export const ValueMatcher = (fn) =>
  IteratorMatcher((iterator) => {
    const { value, done } = iterator.next()
    if (done) {
      return unmatched
    }
    return fn(value)
  })

export const IteratorMatcher = (fn) => {
  fn[matcher] = fn
  return (value) => {
    const iterator =
      typeof value === 'object' && value[internalIterator]
        ? value
        : TimeJumpIterator([value][Symbol.iterator]())
    iterator[internalIterator] = iterator
    return fn(iterator)
  }
}

export const asMatcher = (matchable) => {
  if (matchable === undefined) {
    return equals(undefined)
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
    const result = matcher(iterator)
    if (result.matched) {
      return result
    } else {
      iterator.jump(time)
      return {
        matched: true,
        value: undefined,
      }
    }
  })

export const group = (...expected) =>
  IteratorMatcher((iterator) => {
    const values = []
    const results = []
    for (const element of expected) {
      const matcher = asMatcher(element)
      const result = matcher(iterator)
      if (result.matched) {
        values.push(result.value)
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
    while (true) {
      const time = iterator.now
      const result = matcher(iterator)
      const end = iterator.now
      if (result.matched) {
        if (time === end) {
          throw new Error(
            'some will infinite loop if expected matches but consumes no elements. some of maybe is not possible'
          )
        }
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
  })

export const rest = IteratorMatcher((iterator) => {
  return {
    matched: true,
    value: [...iterator],
  }
})

export const matchArray = (expected) =>
  ValueMatcher((value) => {
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
    iterator[internalIterator] = iterator
    const values = []
    const results = []
    for (const element of expected) {
      const matcher = asMatcher(element)
      const result = matcher(iterator)
      if (result.matched) {
        values.push(result.value)
        results.push(result)
        continue
      }
      return unmatched
    }
    if (iterator.next().done) {
      return {
        matched: true,
        value: values,
        result: results,
      }
    } else {
      return unmatched
    }
  })

export const matchObject = (expected) =>
  ValueMatcher((value) => {
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
    const values = {}
    const results = {}
    const matchedByKey = {}
    const unmatchedKeys = []
    for (const key in expected) {
      const matcher = asMatcher(expected[key])
      if (matcher === rest) {
        restKey = key
        continue
      }

      if (value !== undefined) {
        results[key] = matcher(value[key])
        values[key] = results[key].value
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
      values[restKey] = results[restKey].value
    }
    return {
      matched: true,
      value: values,
      result: results,
    }
  })

export const matchPredicate = (predicate) =>
  ValueMatcher((value) =>
    predicate(value)
      ? {
          matched: true,
          value,
        }
      : unmatched
  )

export const equals = (expected) =>
  matchPredicate((value) => expected === value)

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
  ValueMatcher((value) => {
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
  ValueMatcher((value) => {
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

export const defined = not(equals(undefined))

export const oneOf = (...matchables) =>
  IteratorMatcher((iterator) => {
    const time = iterator.now
    for (const matchable of matchables) {
      const matcher = asMatcher(matchable)
      const result = matcher(iterator)
      if (result.matched) {
        return result
      }
      iterator.jump(time)
    }
    return unmatched
  })

export const allOf = (...matchables) =>
  IteratorMatcher((iterator) => {
    const time = iterator.now
    const end = []
    const results = []
    for (const matchable of matchables) {
      const matcher = asMatcher(matchable)
      iterator.jump(time)
      const result = matcher(iterator)
      end.push(iterator.now)
      results.push(result)
      if (!result.matched) {
        iterator.jump(time)
        return {
          matched: false,
          expected: matchables,
          failed: result,
        }
      }
    }

    if (end.some((c) => c !== end[0])) {
      iterator.jump(time)
      return unmatched
    }
    const values = []
    iterator.jump(time)
    for (let i = time; i < end[0]; i++) {
      values.push(iterator.next().value)
    }

    return {
      matched: true,
      value: values.length <= 1 ? values[0] : values,
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
