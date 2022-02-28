export default (source) => {
  const previous = []
  let sourceIndex = 0
  let sourceDone = false
  let index = 0
  return {
    get now() {
      return index
    },
    jump(time = 0) {
      index = time
    },
    next() {
      if (index === sourceIndex) {
        if (sourceDone) {
          return {
            value: undefined,
            done: true,
          }
        }
        const { value, done } = source.next()
        if (done) {
          sourceDone = true
          return {
            value: undefined,
            done: true,
          }
        }
        previous.push(value)
        sourceIndex += 1
      }
      return {
        value: previous[index++],
        done: false,
      }
    },
    [Symbol.iterator]() {
      return this
    },
  }
}
