import { defined } from '../../index.js'

import { match, when, otherwise } from '../index.js'

export default async (somethingThatRejects, matchable) =>
  match(await matchable)(
    when({ a: defined }, async ({ a }) => await a),
    when({ b: defined }, ({ b }) => b.then(() => 42)),
    otherwise(async () => await somethingThatRejects())
  ) // produces a Promise
