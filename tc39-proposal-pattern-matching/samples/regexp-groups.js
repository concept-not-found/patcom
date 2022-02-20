import { extractMatchedRegExp } from '../../index.js'

import { match, when, otherwise } from '../index.js'

export default (process, handleOtherwise) => (arithmeticStr) =>
  match(arithmeticStr)(
    when(
      /(?<left>\d+) \+ (?<right>\d+)/,
      extractMatchedRegExp(({ groups: { left, right } = {} }) =>
        process(left, right)
      )
    ),
    when(
      /(\d+) \* (\d+)/,
      extractMatchedRegExp(([, left, right]) => process(left, right))
    ),
    otherwise(() => handleOtherwise())
  )
