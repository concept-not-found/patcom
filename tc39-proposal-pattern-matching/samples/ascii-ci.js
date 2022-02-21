import { defined, when } from '../../index.js'

import { match } from '../index.js'

function asciiCI(str) {
  return (matchable) => {
    return {
      matched: str.toLowerCase() == matchable.toLowerCase(),
    }
  }
}

export default (cssProperty) =>
  match(cssProperty)(
    when({ name: asciiCI('color'), value: defined }, ({ value }) =>
      console.log('color: ' + value)
    )
    // matches if `name` is an ASCII case-insensitive match
    // for "color", so `{name:"COLOR", value:"red"} would match.
  )
