export const unmatched = {
  matched: false,
}

export const mapMatched = (valueMapper) => (result) => {
  return {
    ...result,
    value: valueMapper(result.value, result),
  }
}

export const mapMatchedResult = (matchedMapper) => (result) => {
  if (result.matched) {
    return matchedMapper(result)
  } else {
    return result
  }
}

export const mapResult = (valueMapper) =>
  mapMatchedResult(mapMatched(valueMapper))

export const mapResultMatcher = (resultMapper) => (matcher) => (value) =>
  resultMapper(matcher(value))

export const mapMatchedMatcher = (matchedMapper) =>
  mapResultMatcher(mapMatchedResult(matchedMapper))

export const mapMatcher = (valueMapper) =>
  mapResultMatcher(mapResult(valueMapper))

export function fromMatchable(matchable) {
  if (matchable === undefined) {
    return any
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
  return matchable
}

export function matchArray(expected) {
  return (value) => {
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
    for (const [index, element] of expected.entries()) {
      const matcher = fromMatchable(element)
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
  }
}

export function matchObject(expected) {
  return (value) => {
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
      const matcher = fromMatchable(expected[key])
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
  }
}

export const matchIdentical = (expected) => (value) => {
  if (expected === undefined || expected === value) {
    return {
      matched: true,
      value,
    }
  }
  return unmatched
}

export const matchBoolean = (expected) => (value) => {
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
}

export const matchNumber = (expected) => (value) => {
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
}
export const matchBigInt = (expected) => (value) => {
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
}
export const matchNonEmptyString = (value) => {
  if (typeof value === 'string' || value instanceof String) {
    return {
      matched: true,
      value,
    }
  }
  return unmatched
}
export const matchString = (expected) => (value) => {
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
}
export const any = (value) => {
  return {
    matched: true,
    value,
  }
}

export const defined = (value) => {
  if (value === undefined) {
    return unmatched
  }
  return {
    matched: true,
    value,
  }
}
export const rest = () => {
  throw new Error(
    'rest is a marker matcher and does actually match anything. it is intended to used within matchArray and matchObject'
  )
}

export function between(lower, upper) {
  return (value) => {
    if (typeof value === 'number' && lower <= value && value < upper) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}

export function gte(expected) {
  return (value) => {
    if (typeof value === 'number' && expected <= value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}

export function matchRegExp(expected) {
  return (value) => {
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
  }
}

export function oneOf(...matchables) {
  return (value) => {
    let resetValue
    if (
      typeof value !== 'string' &&
      !Array.isArray(value) &&
      value[Symbol.iterator]
    ) {
      resetValue = cachedGenerator(value)
    } else if (typeof value === 'object') {
      value = cachedProperties(value)
    }
    for (const matchable of matchables) {
      if (resetValue) {
        value = resetValue()
      }
      const matcher = fromMatchable(matchable)
      const result = matcher(value)
      if (result.matched) {
        return result
      }
    }
    return unmatched
  }
}

export function cachedProperties(source) {
  const cache = {}
  return new Proxy(source, {
    get(target, prop) {
      if (!cache[prop]) {
        cache[prop] = source[prop]
      }
      return cache[prop]
    },
  })
}

export function cachedGenerator(source) {
  const previous = []
  let sourceIndex = 0
  let sourceDone = false
  return function* reset() {
    let index = 0
    while (true) {
      if (index === sourceIndex) {
        if (sourceDone) {
          return
        }
        const { value, done } = source.next()
        if (done) {
          sourceDone = true
          return
        }
        previous.push(value)
        sourceIndex += 1
      }
      yield previous[index++]
    }
  }
}

export function allOf(...matchables) {
  return (value) => {
    for (const matchable of matchables) {
      const matcher = fromMatchable(matchable)
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
  }
}

export function matchProp(expected) {
  return (value) => {
    if (expected in value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}

export const matchEmpty = (value) => {
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
}
