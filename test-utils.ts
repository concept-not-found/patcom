import { Result, Matched } from '.'

export function expectMatched<T>(
  result: Result<T>
): asserts result is Matched<T> {
  if (!result.matched) {
    console.dir(result)
    throw new Error('expected result to be matched but was unmatched')
  }
}
