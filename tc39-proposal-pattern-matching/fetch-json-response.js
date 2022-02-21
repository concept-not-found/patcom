import { gte, defined, when } from '../index.js'

import { match } from './index.js'

const RequestError = Error

export default async (fetch, jsonService) => {
  const res = await fetch(jsonService)
  match(res)(
    when(
      { status: 200, headers: { 'Content-Length': defined } },
      ({ headers: { 'Content-Length': s } }) => console.log(`size is ${s}`)
    ),
    when({ status: 404 }, () => console.log('JSON not found')),
    when({ status: gte(400) }, () => {
      throw new RequestError(res)
    })
  )
}
