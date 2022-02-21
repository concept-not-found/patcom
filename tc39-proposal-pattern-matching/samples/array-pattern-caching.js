import { matchNumber, when, otherwise } from '../../index.js'

import { match } from '../index.js'

function* integers(to) {
  for (var i = 1; i <= to; i++) yield i
}

export default (n) => {
  const iterable = integers(n)
  match(iterable)(
    when([matchNumber()], ([a]) => console.log(`found one int: ${a}`)),
    // Matching a generator against an array pattern.
    // Obtain the iterator (which is just the generator itself),
    // then pull two items:
    // one to match against the `a` pattern (which succeeds),
    // the second to verify the iterator only has one item
    // (which fails).
    when([matchNumber(), matchNumber()], ([a, b]) =>
      console.log(`found two ints: ${a} and ${b}`)
    ),
    // Matching against an array pattern again.
    // The generator object has already been cached,
    // so we fetch the cached results.
    // We need three items in total;
    // two to check against the patterns,
    // and the third to verify the iterator has only two items.
    // Two are already in the cache,
    // so we’ll just pull one more (and fail the pattern).
    otherwise(() => console.log('more than two ints'))
  )
  console.log([...iterable])
  // logs [4, 5]
  // The match construct pulled three elements from the generator,
  // so there’s two leftover afterwards.
}
