import { matcher } from '../../index.js'

import { match, when } from '../index.js'

class MyClass {
  static [matcher](matchable) {
    return {
      matched: matchable === 3,
      value: { a: 1, b: { c: 2 } },
    }
  }
}

match(3)(
  when(MyClass, () => true), // matches, doesn’t use the result
  when(MyClass, ({ a, b: { c } }) => {
    // passes the custom matcher,
    // then further applies an object pattern to the result’s value
    assert(a === 1)
    assert(c === 2)
  })
)
