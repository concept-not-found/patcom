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
      return matchIdentical(matchable)
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
        if (!Array.isArray(value)) {
          value = [...readValues, ...iterator]
        }
        return {
          matched: true,
          value,
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
    const matchedValue = {}
    if (restKey) {
      matchedValue[restKey] = {}
    }
    for (const key in value) {
      if (!matchedByKey[key]) {
        if (restKey) {
          matchedValue[restKey][key] = value[key]
        } else {
          unmatchedKeys.push(key)
        }
        continue
      }
      matchedValue[key] = value[key]
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
    return {
      matched: true,
      value: matchedValue,
    }
  })

export const matchIdentical = (expected) =>
  Matcher((value) => {
    if (expected === undefined || expected === value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const matchBoolean = (expected) =>
  Matcher((value) => {
    if (
      (expected === undefined && typeof value === 'boolean') ||
      expected === value
    ) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const matchNumber = (expected) =>
  Matcher((value) => {
    if (
      (expected === undefined && typeof value === 'number') ||
      expected === value
    ) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const matchBigInt = (expected) =>
  Matcher((value) => {
    if (
      (expected === undefined && typeof value === 'bigint') ||
      expected === value
    ) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const matchNonEmptyString = Matcher((value) => {
  if (typeof value === 'string' || value instanceof String) {
    return {
      matched: true,
      value,
    }
  }
  return unmatched
})

export const matchString = (expected) =>
  Matcher((value) => {
    if (
      (expected === undefined && typeof value === 'string') ||
      value instanceof String ||
      expected === value
    ) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const any = Matcher((value) => {
  return {
    matched: true,
    value,
  }
})

export const defined = Matcher((value) => {
  if (value === undefined) {
    return unmatched
  }
  return {
    matched: true,
    value,
  }
})

export const rest = Matcher(() => {
  throw new Error(
    'rest is a marker matcher and does actually match anything. it is intended to used within matchArray and matchObject'
  )
})

export const between = (lower, upper) =>
  Matcher((value) => {
    if (typeof value === 'number' && lower <= value && value < upper) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const gt = (expected) =>
  Matcher((value) => {
    if (typeof value === 'number' && expected < value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const gte = (expected) =>
  Matcher((value) => {
    if (typeof value === 'number' && expected <= value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const lt = (expected) =>
  Matcher((value) => {
    if (typeof value === 'number' && expected > value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const lte = (expected) =>
  Matcher((value) => {
    if (typeof value === 'number' && expected >= value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

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
  Matcher((value) => {
    if (expected in value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  })

export const matchEmpty = Matcher((value) => {
  if (Array.isArray(value) && value.length === 0) {
    return {
      matched: true,
      value,
    }
  }
  if (Object.keys(value).length === 0) {
    return {
      matched: true,
      value,
    }
  }
  return unmatched
})

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
