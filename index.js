export function mapMatched(mapper) {
  const matchedMapper = (matched) => {
    return {
      matched: true,
      value: mapper(matched.value),
    }
  }
  matchedMapper.type = 'matched'
  return matchedMapper
}

export const unmatched = {
  matched: false,
}

export function mapResult(mapper) {
  const resultMapper = (result) => {
    if (result.matched) {
      return mapMatched(mapper)(result)
    } else {
      return result
    }
  }
  resultMapper.type = 'result'
  return resultMapper
}
export function mapMatchedResult(matchedMapper) {
  const resultMapper = (result) => {
    if (result.matched) {
      return matchedMapper(result)
    } else {
      return result
    }
  }
  resultMapper.type = 'result'
  return resultMapper
}

export function mapMatcher(mapper) {
  const matcherMapper = (matcher) => (value) =>
    mapResult(mapper)(matcher(value))
  matcherMapper.type = 'matcher'
  return matcherMapper
}

export function asResultMapper(mapperable) {
  switch (mapperable.type) {
    case 'matcher':
      throw new Error('cannot convert matcher mapper to result mapper')
    case 'result': {
      return mapperable
    }
    case 'matched': {
      const matchedMapper = mapperable
      return mapMatchedResult(matchedMapper)
    }
    case 'value':
    default: {
      const valueMapper = mapperable
      return mapResult(valueMapper)
    }
  }
}

export function asMatchedMapper(mapperable) {
  switch (mapperable.type) {
    case 'matched': {
      const matchedMapper = mapperable
      return matchedMapper
    }
    case 'value':
    default: {
      const valueMapper = mapperable
      return mapMatched(valueMapper)
    }
  }
}

export function fromMatchable(matchable) {
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
    if (expected === undefined) {
      if (Array.isArray(value)) {
        return {
          matched: true,
          value,
        }
      } else {
        return unmatched
      }
    }
    for (const [index, element] of expected.entries()) {
      const matcher = fromMatchable(element)
      if (matcher === rest) {
        return {
          matched: true,
          value,
        }
      }
      if (!matcher(value[index]).matched) {
        return unmatched
      }
    }
    if (value.length === expected.length) {
      return {
        matched: true,
        value,
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
      if (key in value && !matcher(value[key]).matched) {
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
export function extractMatchedRegExp(valueMapper) {
  const matchedMapper = (result) => {
    const { matchedRegExp } = result
    return {
      matched: true,
      value: valueMapper(matchedRegExp),
    }
  }
  matchedMapper.type = 'matched'
  return matchedMapper
}

export function oneOf(...matchables) {
  return (value) => {
    for (const matchable of matchables) {
      const matcher = fromMatchable(matchable)
      const result = matcher(value)
      if (result.matched) {
        return result
      }
    }
    return unmatched
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
