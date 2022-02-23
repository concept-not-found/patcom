import { Matcher, asMatcher, unmatched } from '../index.js'

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

export const cachingOneOf = (...matchables) =>
  Matcher((value) => {
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
      const matcher = asMatcher(matchable)
      const result = matcher(value)
      if (result.matched) {
        return result
      }
    }
    return unmatched
  })

export const match =
  (value) =>
  (...clauses) => {
    const result = cachingOneOf(...clauses)(value)
    return result.value
  }
