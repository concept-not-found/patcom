import { jest } from '@jest/globals'

import ArrayLength from './array-length.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('array length sample', () => {
    test('calls handleEmpty on empty res', () => {
      const handleEmpty = jest.fn()
      const handleSinglePage = jest.fn()
      const handleMultiplePages = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = ArrayLength(
        handleEmpty,
        handleSinglePage,
        handleMultiplePages,
        handleOtherwise
      )
      const res = {}
      matcher(res)
      expect(handleEmpty).toHaveBeenNthCalledWith(1)
      expect(handleSinglePage).not.toHaveBeenCalled()
      expect(handleMultiplePages).not.toHaveBeenCalled()
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls handleSinglePage on res with single page in data', () => {
      const handleEmpty = jest.fn()
      const handleSinglePage = jest.fn()
      const handleMultiplePages = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = ArrayLength(
        handleEmpty,
        handleSinglePage,
        handleMultiplePages,
        handleOtherwise
      )
      const res = { data: ['some page'] }
      matcher(res)
      expect(handleSinglePage).toHaveBeenNthCalledWith(1, 'some page')
      expect(handleEmpty).not.toHaveBeenCalled()
      expect(handleMultiplePages).not.toHaveBeenCalled()
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls handleMultiplePages on res with mutiple pages in data', () => {
      const handleEmpty = jest.fn()
      const handleSinglePage = jest.fn()
      const handleMultiplePages = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = ArrayLength(
        handleEmpty,
        handleSinglePage,
        handleMultiplePages,
        handleOtherwise
      )
      const res = { data: ['some page', 'some other page', 'some more pages'] }
      matcher(res)
      expect(handleMultiplePages).toHaveBeenNthCalledWith(1, 'some page', [
        'some other page',
        'some more pages',
      ])
      expect(handleSinglePage).not.toHaveBeenCalled()
      expect(handleEmpty).not.toHaveBeenCalled()
      expect(handleOtherwise).not.toHaveBeenCalled()
    })

    test('calls handleOtherwise when missing data is empty', () => {
      const handleEmpty = jest.fn()
      const handleSinglePage = jest.fn()
      const handleMultiplePages = jest.fn()
      const handleOtherwise = jest.fn()
      const matcher = ArrayLength(
        handleEmpty,
        handleSinglePage,
        handleMultiplePages,
        handleOtherwise
      )
      const res = { data: [] }
      matcher(res)
      expect(handleOtherwise).toHaveBeenNthCalledWith(1)
      expect(handleSinglePage).not.toHaveBeenCalled()
      expect(handleMultiplePages).not.toHaveBeenCalled()
      expect(handleEmpty).not.toHaveBeenCalled()
    })
  })
})
