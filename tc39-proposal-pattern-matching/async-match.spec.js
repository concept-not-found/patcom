import { jest } from '@jest/globals'

import { AsyncMatch } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('async match sample', () => {
    test('returns a promise for an object with the field a', async () => {
      const somethingThatRejects = jest.fn()
      const matcher = AsyncMatch(
        somethingThatRejects,
        Promise.resolve({ a: Promise.resolve('some value for a') })
      )
      await expect(matcher).resolves.toBe('some value for a')
      expect(somethingThatRejects).not.toHaveBeenCalled()
    })

    test('returns a promise 42 for an object with the field b', async () => {
      const somethingThatRejects = jest.fn()
      const matcher = AsyncMatch(
        somethingThatRejects,
        Promise.resolve({ b: Promise.resolve('some value for b') })
      )
      await expect(matcher).resolves.toBe(42)
      expect(somethingThatRejects).not.toHaveBeenCalled()
    })

    test('returns a rejected promise empty object', async () => {
      const somethingThatRejects = jest.fn().mockRejectedValue(69)
      const matcher = AsyncMatch(somethingThatRejects, Promise.resolve({}))
      await expect(matcher).rejects.toBe(69)
      expect(somethingThatRejects).toHaveBeenCalled()
    })
  })
})
