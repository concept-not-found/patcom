import { matcher, when } from '../../index.js'

import { match } from '../index.js'

const Exception = Error

export class Option {
  constructor(hasValue, value) {
    this.hasValue = !!hasValue
    if (hasValue) {
      this._value = value
    }
  }
  get value() {
    if (this.hasValue) return this._value
    throw new Exception("Can't get the value of an Option.None.")
  }

  static Some(val) {
    return new Option(true, val)
  }
  static None() {
    return new Option(false)
  }
}

Option.Some[matcher] = (val) => ({
  matched: val instanceof Option && val.hasValue,
  value: val instanceof Option && val.hasValue && val.value,
})
Option.None[matcher] = (val) => ({
  matched: val instanceof Option && !val.hasValue,
})

export default (result) =>
  match(result)(
    when(Option.Some, (val) => console.log(val)),
    when(Option.None, () => console.log('none'))
  )
