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
