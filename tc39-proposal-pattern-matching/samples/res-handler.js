import { matchString, between, any, rest } from '../../index.js'

import { match, when, otherwise, guard } from '../index.js'

export default (handleData, handleRedirect, retry, throwSomething) =>
  class RetryableHandler {
    constructor() {
      this.hasRetried = false
    }

    handle(req, res) {
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
