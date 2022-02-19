export type ValueMapper<T, R> = (value: T) => R
export type Matched<T> = {
  matched: true
  value: T
}
type MatchedMapper<T, R> = (matched: Matched<T>) => Matched<R>
export function mapMatched<T, R>(
  mapper: ValueMapper<T, R>
): MatchedMapper<T, R> {
  return (matched: Matched<T>) => {
    return {
      matched: true,
      value: mapper(matched.value),
    }
  }
}

export type Unmatched = {
  matched: false
}
export const unmatched: Unmatched = {
  matched: false,
}

export type Result<T> = Matched<T> | Unmatched
type ResultMapper<T, R> = (result: Result<T>) => Result<R>
export function mapResult<T, R>(mapper: ValueMapper<T, R>): ResultMapper<T, R> {
  return (result: Result<T>) => {
    if (result.matched) {
      return mapMatched(mapper)(result)
    } else {
      return result
    }
  }
}

export type Matcher<T> = (value: any) => Result<T>
type MatcherMapper<T, R> = (matcher: Matcher<T>) => Matcher<R>
export function mapMatcher<T, R>(
  mapper: ValueMapper<T, R>
): MatcherMapper<T, R> {
  return (matcher: Matcher<T>) => (value: any) =>
    mapResult(mapper)(matcher(value))
}

export type Matchable<T> = T extends undefined
  ? T
  : T extends Matcher<infer R>
  ? R
  : T extends [infer HEAD, ...infer TAIL]
  ? [Matchable<HEAD>, ...Matchable<TAIL>]
  : T extends object
  ? {
      [Key in keyof T]: T[Key] extends Matcher<infer S> ? S : Matchable<T[Key]>
    }
  : T extends RegExp
  ? string
  : T

type UnionMatchable<T extends any[]> = T extends [infer HEAD, ...infer TAIL]
  ? Matchable<HEAD> | UnionMatchable<TAIL>
  : never

type IntersectMatchable<T extends any[]> = T extends [infer HEAD, ...infer TAIL]
  ? Matchable<HEAD> & IntersectMatchable<TAIL>
  : never

export function matchArray<T extends any[]>(
  expected?: T
): Matcher<Matchable<T>> {
  return (value: any) => {
    if (expected === undefined) {
      return {
        matched: true,
        value,
      }
    }
    if (!Array.isArray(value) || expected.length !== value.length) {
      return unmatched
    }
    for (const [index, element] of expected.entries()) {
      const matcher: Matcher<any> = fromMatchable(element)
      if (!matcher(value[index]).matched) {
        return unmatched
      }
    }
    return {
      matched: true,
      value: value as Matchable<T>,
    }
  }
}

export function matchObject<T extends object>(
  expected?: T
): Matcher<Matchable<T>> {
  return (value: any) => {
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
    let restKey: string | undefined = undefined
    const matchedByKey: Record<string, boolean> = {}
    const unmatchedKeys = []
    for (const key in expected) {
      const matcher: Matcher<any> = fromMatchable(expected[key])
      if (matcher === rest) {
        restKey = key
        continue
      }
      if (!matcher(value[key]).matched) {
        unmatchedKeys.push(key)
        continue
      }
      matchedByKey[key] = true
    }
    const matchedValue: Record<string, any> = {}
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
      value: matchedValue as Matchable<Matchable<T>>,
    }
  }
}

export function matchIdentical<T>(expected?: T): Matcher<Matchable<T>> {
  return (value: any) => {
    if (expected === undefined) {
      return {
        matched: true,
        value,
      }
    }
    if (expected === value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}
export const matchBoolean: (expected?: boolean) => Matcher<boolean> =
  matchIdentical
export const matchNumber: (expected?: number) => Matcher<number> =
  matchIdentical
export const matchString: (expected?: string) => Matcher<string> =
  matchIdentical
export const any: Matcher<any> = (value: any) => {
  return {
    matched: true,
    value,
  }
}

export const rest: Matcher<object> = (value: any) => {
  return {
    matched: true,
    value,
  }
}

export function between(lower: number, upper: number): Matcher<number> {
  return (value: any) => {
    if (typeof value === 'number' && lower <= value && value < upper) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}

export function matchRegExp(expected: RegExp): Matcher<string> {
  return (value: any) => {
    if (typeof value === 'string' || value instanceof String) {
      const regexMatchResult = value.match(expected)
      if (regexMatchResult) {
        return {
          matched: true,
          value: value as string,
        }
      }
      return {
        matched: false,
        expected,
        regexMatchResult,
      }
    }
    return {
      matched: false,
      expected,
      typeofValue: typeof value,
    }
  }
}

export function fromMatchable<T>(matchable: T): Matcher<Matchable<T>> {
  if (Array.isArray(matchable)) {
    return matchArray(matchable)
  }
  if (matchable instanceof RegExp) {
    return matchRegExp(matchable) as Matcher<Matchable<T>>
  }
  switch (typeof matchable) {
    case 'boolean':
    case 'number':
    case 'string':
      return matchIdentical(matchable)
    case 'object':
      return matchObject(matchable as unknown as object) as Matcher<
        Matchable<T>
      >
  }
  return matchable as unknown as Matcher<Matchable<T>>
}

export function oneOf<T extends any[]>(
  ...matchables: T
): Matcher<UnionMatchable<T>> {
  return (value: any) => {
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

export function allOf<T extends any[]>(
  ...matchables: T
): Matcher<IntersectMatchable<T>> {
  return (value: any) => {
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

export function matchProp<T extends object>(expected: string): Matcher<T> {
  return (value: T) => {
    if (expected in value) {
      return {
        matched: true,
        value,
      }
    }
    return unmatched
  }
}
