import { matchEmpty, defined, rest, when, otherwise } from '../index.js'
import { match } from './index.js'

export default (
    handleEmpty,
    handleSinglePage,
    handleMultiplePages,
    handleOtherwise
  ) =>
  (res) =>
    match(res)(
      when(matchEmpty, () => handleEmpty()),
      when({ data: [defined] }, ({ data: [page] }) => handleSinglePage(page)),
      when({ data: [defined, rest] }, ({ data: [frontPage, ...pages] }) =>
        handleMultiplePages(frontPage, pages)
      ),
      otherwise(() => handleOtherwise())
    )
