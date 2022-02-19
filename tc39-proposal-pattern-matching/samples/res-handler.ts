import { matchString, between, any, rest } from '../..'

import { match, when, otherwise, guard } from '..'

export default (
  handleData: (body: any, rest: any) => void,
  handleRedirect: (url: string) => void,
  retry: (req: any) => void,
  throwSomething: () => void
) =>
  class RetryableHandler {
    hasRetried: boolean

    constructor() {
      this.hasRetried = false
    }

    handle(req: any, res: object) {
      match(res)(
        when({ status: 200, body: any, rest }, ({ body, rest }) =>
          handleData(body, rest)
        ),
        when(
          { status: between(300, 400), destination: matchString() },
          ({ destination: url }) => handleRedirect(url)
        ),
        when(
          guard({ status: 500 }, () => !this.hasRetried),
          () => {
            retry(req)
            this.hasRetried = true
          }
        ),
        otherwise(() => throwSomething())
      )
    }
  }
