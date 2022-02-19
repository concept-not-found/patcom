import { matchEmpty, matchArray, matchNonEmptyString, rest } from '../..'
import { match, when, otherwise } from '..'

type Page = string

export default (
    handleEmpty: () => void,
    handleSinglePage: (page: Page) => void,
    handleMultiplePages: (frontPage: Page, pages: Page[]) => void,
    handleOtherwise: () => void
  ) =>
  (res: object) =>
    match(res)(
      when(matchEmpty, () => handleEmpty()),
      when({ data: [matchNonEmptyString] }, ({ data: [page] }) =>
        handleSinglePage(page)
      ),
      when(
        { data: matchArray([matchNonEmptyString, rest]) },
        ({ data: [frontPage, ...pages] }) =>
          handleMultiplePages(frontPage, pages)
      ),
      otherwise(() => handleOtherwise())
    )
