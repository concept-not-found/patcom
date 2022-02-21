import { defined, when } from '../index.js'

import { match } from './index.js'

export default (someArr) =>
  match(someArr)(when([, , defined], ([, , someVal]) => console.log(someVal)))
