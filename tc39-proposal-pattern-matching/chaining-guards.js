import { gt, defined, when, otherwise } from '../index.js'

import { match } from './index.js'

export default (res) =>
  match(res)(
    when({ pages: gt(1), data: defined }, () => console.log('multiple pages')),
    when({ pages: 1, data: defined }, () => console.log('one page')),
    otherwise(() => console.log('no pages'))
  )
