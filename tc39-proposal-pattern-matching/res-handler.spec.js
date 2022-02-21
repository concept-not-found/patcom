import { jest } from '@jest/globals'

import { ResHandler } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('res handler sample', () => {
    test('handleData called on status 200', () => {
      const handleData = jest.fn()
      const handleRedirect = jest.fn()
      const retry = jest.fn()
      const throwSomething = jest.fn()
      const RetryableHandler = ResHandler(
        handleData,
        handleRedirect,
        retry,
        throwSomething
      )
      const retryableHandler = new RetryableHandler()
      const req = 'some request'
      const res = {
        status: 200,
        body: 'some body',
        otherField: 'other field',
        moreField: 'more field',
      }
      retryableHandler.handle(req, res)
      expect(handleData).toHaveBeenNthCalledWith(1, 'some body', {
        otherField: 'other field',
        moreField: 'more field',
      })
      expect(handleRedirect).not.toHaveBeenCalled()
      expect(retry).not.toHaveBeenCalled()
      expect(throwSomething).not.toHaveBeenCalled()
    })

    test.each([
      {
        status: 300,
      },
      {
        status: 301,
      },
      {
        status: 302,
      },
      {
        status: 399,
      },
    ])('handleRedirect called on status $status', ({ status }) => {
      const handleData = jest.fn()
      const handleRedirect = jest.fn()
      const retry = jest.fn()
      const throwSomething = jest.fn()
      const RetryableHandler = ResHandler(
        handleData,
        handleRedirect,
        retry,
        throwSomething
      )
      const retryableHandler = new RetryableHandler()
      const req = 'some request'
      const res = {
        status,
        destination: 'some url',
      }
      retryableHandler.handle(req, res)
      expect(handleRedirect).toHaveBeenNthCalledWith(1, 'some url')
      expect(handleData).not.toHaveBeenCalled()
      expect(retry).not.toHaveBeenCalled()
      expect(throwSomething).not.toHaveBeenCalled()
    })

    test('retry called on status 500 on the first attempt', () => {
      const handleData = jest.fn()
      const handleRedirect = jest.fn()
      const retry = jest.fn()
      const throwSomething = jest.fn()
      const RetryableHandler = ResHandler(
        handleData,
        handleRedirect,
        retry,
        throwSomething
      )
      const retryableHandler = new RetryableHandler()
      const req = 'some request'
      const res = {
        status: 500,
      }
      retryableHandler.handle(req, res)
      expect(retry).toHaveBeenNthCalledWith(1, 'some request')
      expect(handleData).not.toHaveBeenCalled()
      expect(handleRedirect).not.toHaveBeenCalled()
      expect(throwSomething).not.toHaveBeenCalled()
    })

    test('throwSomething called on consecutive status 500', () => {
      const handleData = jest.fn()
      const handleRedirect = jest.fn()
      const retry = jest.fn()
      const throwSomething = jest.fn()
      const RetryableHandler = ResHandler(
        handleData,
        handleRedirect,
        retry,
        throwSomething
      )
      const retryableHandler = new RetryableHandler()
      const req = 'some request'
      const res = {
        status: 500,
      }
      retryableHandler.handle(req, res)
      retryableHandler.handle(req, res)
      expect(retry).toHaveBeenCalledTimes(1)
      expect(throwSomething).toHaveBeenCalledTimes(1)
      expect(handleData).not.toHaveBeenCalled()
      expect(handleRedirect).not.toHaveBeenCalled()
    })

    test('throwSomething called on status 400', () => {
      const handleData = jest.fn()
      const handleRedirect = jest.fn()
      const retry = jest.fn()
      const throwSomething = jest.fn()
      const RetryableHandler = ResHandler(
        handleData,
        handleRedirect,
        retry,
        throwSomething
      )
      const retryableHandler = new RetryableHandler()
      const req = 'some request'
      const res = {
        status: 400,
      }
      retryableHandler.handle(req, res)
      expect(throwSomething).toHaveBeenCalledTimes(1)
      expect(handleData).not.toHaveBeenCalled()
      expect(retry).not.toHaveBeenCalled()
      expect(handleRedirect).not.toHaveBeenCalled()
    })
  })
})
