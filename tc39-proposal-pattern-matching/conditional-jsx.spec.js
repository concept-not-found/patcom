import { jest } from '@jest/globals'

import ConditionalJsx from './conditional-jsx.js'

function h(component, props, children) {
  return component({ ...props, children })
}
describe('tc39-proposal-pattern-matching', () => {
  describe('conditional jsx sample', () => {
    test('returns Loading component when loading field is present', () => {
      const Fetch = ({ children }) => {
        return children({ loading: true })
      }
      const Loading = () => 'Loading'
      const Error = ({ error }) => `Failed with ${error}`
      const Page = ({ data }) => `Page with ${data}`
      const Component = ConditionalJsx(
        h,
        'some api url',
        Fetch,
        Loading,
        Error,
        Page
      )
      expect(h(Component)).toBe('Loading')
    })

    test('returns Error component when error field is present', () => {
      const Fetch = ({ children }) => {
        return children({ error: 'some error' })
      }
      global.console.err = jest.fn()
      const Loading = () => 'Loading'
      const Error = ({ error }) => `Failed with ${error}`
      const Page = ({ data }) => `Page with ${data}`
      const Component = ConditionalJsx(
        h,
        'some api url',
        Fetch,
        Loading,
        Error,
        Page
      )
      expect(h(Component)).toBe('Failed with some error')
      expect(global.console.err).toHaveBeenNthCalledWith(
        1,
        'something bad happened'
      )
      delete global.console.err
    })

    test('returns Page component when data field is present', () => {
      const Fetch = ({ children }) => {
        return children({ data: 'some data' })
      }
      const Loading = () => 'Loading'
      const Error = ({ error }) => `Failed with ${error}`
      const Page = ({ data }) => `Page with ${data}`
      const Component = ConditionalJsx(
        h,
        'some api url',
        Fetch,
        Loading,
        Error,
        Page
      )
      expect(h(Component)).toBe('Page with some data')
    })

    test('returns nothing otherwise', () => {
      const Fetch = ({ children }) => {
        return children({})
      }
      const Loading = () => 'Loading'
      const Error = ({ error }) => `Failed with ${error}`
      const Page = ({ data }) => `Page with ${data}`
      const Component = ConditionalJsx(
        h,
        'some api url',
        Fetch,
        Loading,
        Error,
        Page
      )
      expect(h(Component)).toBe()
    })
  })
})
