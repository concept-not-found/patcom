import { jest } from '@jest/globals'

import RegExpGroups from './regexp-groups.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('regexp groups sample', () => {
    test('calls process with named groups on 1 + 2', () => {
      const process = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = RegExpGroups(process, handleOtherwise)
      const arithmeticStr = '1 + 2'
      matcher(arithmeticStr)
      expect(process).toHaveBeenNthCalledWith(1, '1', '2')
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls process with array match on 1 * 2', () => {
      const process = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = RegExpGroups(process, handleOtherwise)
      const arithmeticStr = '1 * 2'
      matcher(arithmeticStr)
      expect(process).toHaveBeenNthCalledWith(1, '1', '2')
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls handleOtherwise on 1 / 2', () => {
      const process = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = RegExpGroups(process, handleOtherwise)
      const arithmeticStr = '1 / 2'
      matcher(arithmeticStr)
      expect(handleOtherwise).toHaveBeenNthCalledWith(1)
      expect(process).not.toHaveBeenCalled()
    })
  })
})
