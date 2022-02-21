import { matcher } from '../index.js'

export default class Foo {
  static [matcher](value) {
    return {
      matched: value instanceof Foo,
      value,
    }
  }
}
