import {
  ValueMapper,
  Matchable,
  Result,
  Matcher,
  fromMatchable,
  unmatched,
  mapResult,
} from '..'

export function when<T, R>(
  matchable: T,
  onMatch: ValueMapper<Matchable<T>, R>
): Clause<Matchable<T>, R> {
  const matcher = fromMatchable(matchable)
  const whenMatcher = matcher as Clause<Matchable<T>, R>
  whenMatcher.onMatch = onMatch
  return whenMatcher
}

export function otherwise<T, R>(onMatch: ValueMapper<T, R>): Clause<T, R> {
  const matcher = (value: any) => {
    return {
      matched: true,
      value,
    }
  }
  matcher.onMatch = onMatch
  return matcher
}
type OnMatch<T, R> = {
  onMatch: ValueMapper<T, R>
}
type Clause<T, R> = Matcher<R> & OnMatch<T, R>

type Predicate<T> = ValueMapper<T, boolean>

export function guard<T>(
  matchable: T,
  predicate: Predicate<Matchable<T>>
): Matcher<Matchable<T>> {
  const matcher = fromMatchable(matchable)
  return (value: any) => {
    const result = matcher(value)
    if (result.matched && predicate(result.value)) {
      return result
    }
    return unmatched
  }
}

export const match =
  (value: any) =>
  <T>(...clauses: Clause<any, T>[]): Result<T> => {
    for (const clause of clauses) {
      const result = clause(value)
      if (result.matched) {
        return mapResult(clause.onMatch)(result)
      }
    }
    return unmatched
  }
