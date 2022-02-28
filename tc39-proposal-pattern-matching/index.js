import { Matcher, asMatcher, unmatched } from '../index.js'
import TimeJumpIterator from '../time-jump-iterator.js'

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

export const cachingOneOf = (...matchables) =>
  Matcher((value) => {
    const iteratorValue =
      typeof value !== 'string' &&
      !Array.isArray(value) &&
      value[Symbol.iterator]
    if (iteratorValue) {
      value = TimeJumpIterator(value)
    } else if (typeof value === 'object') {
      value = cachedProperties(value)
    }
    for (const matchable of matchables) {
      if (iteratorValue) {
        value.jump(0)
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
