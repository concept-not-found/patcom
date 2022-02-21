import { when, otherwise } from '../index.js'

import { match } from './index.js'

export default (process, handleOtherwise) => (arithmeticStr) =>
  match(arithmeticStr)(
    when(
      /(?<left>\d+) \+ (?<right>\d+)/,
      (value, { matchedRegExp: { groups: { left, right } = {} } }) =>
        process(left, right)
    ),
    when(/(\d+) \* (\d+)/, (value, { matchedRegExp: [, left, right] }) =>
      process(left, right)
    ),
    otherwise(() => handleOtherwise())
  )
