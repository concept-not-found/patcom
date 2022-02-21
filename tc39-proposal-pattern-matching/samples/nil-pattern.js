import { defined } from '../../index.js'

import { match, when } from '../index.js'

export default (someArr) =>
  match(someArr)(when([, , defined], ([, , someVal]) => console.log(someVal)))
