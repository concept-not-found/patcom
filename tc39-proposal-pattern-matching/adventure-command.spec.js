import { jest } from '@jest/globals'

import AdventureCommand from './adventure-command'

describe('tc39-proposal-pattern-matching', () => {
  describe('adventure command sample', () => {
    test.each([
      {
        command: ['go', 'north'],
        expectedDir: 'north',
      },
      {
        command: ['go', 'east'],
        expectedDir: 'east',
      },
      {
        command: ['go', 'south'],
        expectedDir: 'south',
      },
      {
        command: ['go', 'west'],
        expectedDir: 'west',
      },
    ])('calls handleGoDir on $command', ({ command, expectedDir }) => {
      const handleGoDir = jest.fn()
      const handleTakeItem = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = AdventureCommand(
        handleGoDir,
        handleTakeItem,
        handleOtherwise
      )
      matcher(command)
      expect(handleGoDir).toHaveBeenNthCalledWith(1, expectedDir)
      expect(handleTakeItem).not.toHaveBeenCalled()
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls handleTakeItem on ["take", "something ball"], where "something ball" has a weight field', () => {
      const handleGoDir = jest.fn()
      const handleTakeItem = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = AdventureCommand(
        handleGoDir,
        handleTakeItem,
        handleOtherwise
      )
      const ball = new String('something ball')
      ball.weight = 69
      matcher(['take', ball])
      expect(handleTakeItem).toHaveBeenNthCalledWith(1, ball)
      expect(handleGoDir).not.toHaveBeenCalled()
      expect(handleOtherwise).not.toHaveBeenCalled()
    })
  })
})
