import { matchNumber, matchString, when } from '../../index.js'

import { match } from '../index.js'

export default () => {
  const randomItem = {
    get numOrString() {
      // console.trace()
      return Math.random() < 0.5 ? 1 : '1'
    },
  }

  match(randomItem)(
    when({ numOrString: matchNumber() }, () =>
      console.log('Only matches half the time.')
    ),
    // Whether the pattern matches or not,
    // we cache the (randomItem, "numOrString") pair
    // with the result.
    when({ numOrString: matchString() }, () =>
      console.log('Guaranteed to match the other half of the time.')
    )
    // Since (randomItem, "numOrString") has already been cached,
    // we reuse the result here;
    // if it was a string for the first clause,
    // it’s the same string here.
  )
}
