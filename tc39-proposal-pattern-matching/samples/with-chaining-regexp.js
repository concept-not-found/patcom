import { match, when } from '../index.js'

export default () =>
  match('foobar')(
    when(/foo(.*)/, (value, { matchedRegExp: [, suffix] }) =>
      console.log(suffix)
    )
    // logs "bar", since the match result
    // is an array-like containing the whole match
    // followed by the groups.
    // note the hole at the start of the array matcher
    // ignoring the first item,
    // which is the entire match "foobar".
  )
