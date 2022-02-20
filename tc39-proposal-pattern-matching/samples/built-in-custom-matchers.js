import {
  matchNumber,
  matchBigInt,
  matchString,
  matchArray,
} from '../../index.js'

import { match, when, otherwise } from '../index.js'

export default (value) =>
  match(value)(
    when(matchNumber(), (value) => console.log('Number', value)),
    when(matchBigInt(), (value) => console.log('BigInt', value)),
    when(matchString(), (value) => console.log('String', value)),
    when(matchArray(), (value) => console.log('Array', value)),
    otherwise((value) => console.log('otherwise', value))
  )
