import { jest } from '@jest/globals'

import { CustomMatcherOption, Option } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('customer matcher sample', () => {
    test('call console.log with val on some result', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = CustomMatcherOption
      matcher(Option.Some('some value'))
      expect(log).toHaveBeenNthCalledWith(1, 'some value')
    })

    test('call console.log with none on none result', () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      const matcher = CustomMatcherOption
      matcher(Option.None())
      expect(log).toHaveBeenNthCalledWith(1, 'none')
    })
  })
})
