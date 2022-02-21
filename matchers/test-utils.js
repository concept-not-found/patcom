export function expectMatched(result) {
  if (!result.matched) {
    console.dir(result)
    throw new Error('expected result to be matched but was unmatched')
  }
}
