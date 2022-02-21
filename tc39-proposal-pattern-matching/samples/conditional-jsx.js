import { defined, when } from '../../index.js'

import { match } from '../index.js'

export default (h, API_URL, Fetch, Loading, Error, Page) => () =>
  h(Fetch, { url: API_URL }, (props) =>
    match(props)(
      when({ loading: defined }, () => h(Loading)),
      when({ error: defined }, ({ error }) => {
        console.err('something bad happened')
        return h(Error, { error })
      }),
      when({ data: defined }, ({ data }) => h(Page, { data }))
    )
  )
