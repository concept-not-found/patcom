import { jest } from '@jest/globals'

import FetchJsonResponse from './fetch-json-response.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('fetch json response sample', () => {
    test('call console.log with content length on 200', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      async function fetch() {
        return {
          status: 200,
          headers: { 'Content-Length': 42 },
        }
      }
      await FetchJsonResponse(fetch)
      expect(log).toHaveBeenNthCalledWith(1, 'size is 42')
    })

    test('call console.log with not found on 404', async () => {
      const log = jest.spyOn(global.console, 'log').mockImplementation()
      async function fetch() {
        return {
          status: 404,
        }
      }
      await FetchJsonResponse(fetch)
      expect(log).toHaveBeenNthCalledWith(1, 'JSON not found')
    })

    test.each([{ status: 400 }, { status: 401 }, { status: 500 }])(
      'throws if status is $status',
      ({ status }) => {
        async function fetch() {
          return {
            status,
          }
        }
        expect(FetchJsonResponse(fetch)).rejects.toThrow()
      }
    )
  })
})
