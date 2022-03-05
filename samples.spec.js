import { expectUnmatched } from './matchers/test-utils.js'
import {
  asInternalIterator,
  group,
  some,
  maybe,
  matchArray,
  matchObject,
  match,
  when,
  otherwise,
  defined,
  rest,
} from './index.js'

describe('samples', () => {
  describe('discriminating unions', () => {
    const greeter = (person) =>
      match(person)(
        when(
          { role: 'teacher', surname: defined },
          ({ surname }) => `Good morning ${surname} sensei.`
        ),
        when({ role: 'student' }, () => 'Hello fellow student.'),
        otherwise(() => 'STRANGER DANGER')
      )

    test('greet teacher', () => {
      const person = {
        role: 'teacher',
        surname: 'Wong',
      }
      expect(greeter(person)).toBe('Good morning Wong sensei.')
    })

    test('greet student', () => {
      const person = {
        role: 'student',
      }
      expect(greeter(person)).toBe('Hello fellow student.')
    })

    test('otherwise alarm', () => {
      const person = {
        role: 'robot',
      }
      expect(greeter(person)).toBe('STRANGER DANGER')
    })
  })

  describe('access nested rest', () => {
    const matcher = when(
      {
        headers: [
          {
            name: 'cookie',
            value: defined,
          },
          rest,
        ],
        rest,
      },
      ({
        headers: [{ value: cookieValue }, restOfHeaders],
        rest: restOfResponse,
      }) => ({ cookieValue, restOfHeaders, restOfResponse })
    )

    test('extra headers and response values are accessible', () => {
      const result = match({
        status: 200,
        headers: [
          {
            name: 'cookie',
            value: 'om',
          },
          {
            name: 'accept',
            value: 'everybody',
          },
        ],
      })(matcher)
      expect(result).toEqual({
        cookieValue: 'om',
        restOfHeaders: [{ name: 'accept', value: 'everybody' }],
        restOfResponse: { status: 200 },
      })
    })
  })

  describe('matchArray example', () => {
    test('rest', () => {
      const matcher = matchArray([42, 'alice', rest])

      expect(matcher([42, 'alice'])).toEqual({
        matched: true,
        value: [42, 'alice', []],
        result: [
          { matched: true, value: 42 },
          { matched: true, value: 'alice' },
          { matched: true, value: [] },
        ],
      })
      expect(matcher([42, 'alice', true, 69])).toEqual({
        matched: true,
        value: [42, 'alice', [true, 69]],
        result: [
          { matched: true, value: 42 },
          { matched: true, value: 'alice' },
          { matched: true, value: [true, 69] },
        ],
      })

      expectUnmatched(matcher(['alice', 42]))
      expectUnmatched(matcher([]))
      expectUnmatched(matcher([42]))
    })
  })

  describe('matchObject example', () => {
    test('rest', () => {
      const matcher = matchObject({ x: 42, y: 'alice', rest })

      expect(matcher({ x: 42, y: 'alice' })).toEqual({
        matched: true,
        value: { x: 42, y: 'alice', rest: {} },
        result: {
          x: { matched: true, value: 42 },
          y: { matched: true, value: 'alice' },
          rest: { matched: true, value: {} },
        },
      })
      expect(matcher({ x: 42, y: 'alice', z: true, aa: 69 })).toEqual({
        matched: true,
        value: {
          x: 42,
          y: 'alice',
          rest: { z: true, aa: 69 },
        },
        result: {
          x: { matched: true, value: 42 },
          y: { matched: true, value: 'alice' },
          rest: { matched: true, value: { z: true, aa: 69 } },
        },
      })

      expectUnmatched(matcher({}))
      expectUnmatched(matcher({ x: 42 }))
    })
    test('custom rest key', () => {
      const matcher = matchObject({ x: 42, y: 'alice', customRestKey: rest })

      expect(matcher({ x: 42, y: 'alice', z: true })).toEqual({
        matched: true,
        value: {
          x: 42,
          y: 'alice',
          customRestKey: { z: true },
        },
        result: {
          x: { matched: true, value: 42 },
          y: { matched: true, value: 'alice' },
          customRestKey: { matched: true, value: { z: true } },
        },
      })
    })
  })

  describe('maybe example', () => {
    test('only maybe', () => {
      const matcher = matchArray([maybe('alice'), 'bob'])

      expect(matcher(['alice', 'bob'])).toEqual({
        matched: true,
        value: ['alice', 'bob'],
        result: [
          {
            matched: true,
            value: 'alice',
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['bob'])).toEqual({
        matched: true,
        value: [undefined, 'bob'],
        result: [
          { matched: true, value: undefined },
          { matched: true, value: 'bob' },
        ],
      })

      expectUnmatched(matcher(['eve', 'bob']))
      expectUnmatched(matcher(['eve']))
    })
    test('maybe of group', () => {
      const matcher = matchArray([maybe(group('alice', 'fred')), 'bob'])

      expect(matcher(['alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [['alice', 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice', 'fred'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['bob'])).toEqual({
        matched: true,
        value: [undefined, 'bob'],
        result: [
          { matched: true, value: undefined },
          { matched: true, value: 'bob' },
        ],
      })
    })

    test('maybe of some', () => {
      const matcher = matchArray([maybe(some('alice')), 'bob'])

      expect(matcher(['alice', 'bob'])).toEqual({
        matched: true,
        value: [['alice'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice'],
            result: [{ matched: true, value: 'alice' }],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['alice', 'alice', 'bob'])).toEqual({
        matched: true,
        value: [['alice', 'alice'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice', 'alice'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'alice' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['bob'])).toEqual({
        matched: true,
        value: [undefined, 'bob'],
        result: [
          { matched: true, value: undefined },
          { matched: true, value: 'bob' },
        ],
      })
    })
  })

  describe('some example', () => {
    test('just some', () => {
      const matcher = matchArray([some('alice'), 'bob'])

      expect(matcher(['alice', 'alice', 'bob'])).toEqual({
        matched: true,
        value: [['alice', 'alice'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice', 'alice'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'alice' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })

      expectUnmatched(matcher(['eve', 'bob']))
      expectUnmatched(matcher(['bob']))
    })
    test('some of group', () => {
      const matcher = matchArray([some(group('alice', 'fred')), 'bob'])

      expect(matcher(['alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [[['alice', 'fred']], 'bob'],
        result: [
          {
            matched: true,
            value: [['alice', 'fred']],
            result: [
              {
                matched: true,
                value: ['alice', 'fred'],
                result: [
                  { matched: true, value: 'alice' },
                  { matched: true, value: 'fred' },
                ],
              },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['alice', 'fred', 'alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [
          [
            ['alice', 'fred'],
            ['alice', 'fred'],
          ],
          'bob',
        ],
        result: [
          {
            matched: true,
            value: [
              ['alice', 'fred'],
              ['alice', 'fred'],
            ],
            result: [
              {
                matched: true,
                value: ['alice', 'fred'],
                result: [
                  { matched: true, value: 'alice' },
                  { matched: true, value: 'fred' },
                ],
              },
              {
                matched: true,
                value: ['alice', 'fred'],
                result: [
                  { matched: true, value: 'alice' },
                  { matched: true, value: 'fred' },
                ],
              },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
    })
  })

  describe('group example', () => {
    test('just group', () => {
      const matcher = matchArray([group('alice', 'fred'), 'bob'])

      expect(matcher(['alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [['alice', 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice', 'fred'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })

      expectUnmatched(matcher(['alice', 'eve', 'bob']))
      expectUnmatched(matcher(['eve', 'fred', 'bob']))
      expectUnmatched(matcher(['alice', 'bob']))
      expectUnmatched(matcher(['fred', 'bob']))
      expectUnmatched(matcher(['bob']))
    })
    test('group of maybe', () => {
      const matcher = matchArray([group(maybe('alice'), 'fred'), 'bob'])

      expect(matcher(['fred', 'bob'])).toEqual({
        matched: true,
        value: [[undefined, 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: [undefined, 'fred'],
            result: [
              { matched: true, value: undefined },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [['alice', 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: ['alice', 'fred'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
    })
    test('group of some', () => {
      const matcher = matchArray([group(some('alice'), 'fred'), 'bob'])

      expect(matcher(['alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [[['alice'], 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: [['alice'], 'fred'],
            result: [
              {
                matched: true,
                value: ['alice'],
                result: [{ matched: true, value: 'alice' }],
              },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })
      expect(matcher(['alice', 'alice', 'fred', 'bob'])).toEqual({
        matched: true,
        value: [[['alice', 'alice'], 'fred'], 'bob'],
        result: [
          {
            matched: true,
            value: [['alice', 'alice'], 'fred'],
            result: [
              {
                matched: true,
                value: ['alice', 'alice'],
                result: [
                  { matched: true, value: 'alice' },
                  { matched: true, value: 'alice' },
                ],
              },
              { matched: true, value: 'fred' },
            ],
          },
          { matched: true, value: 'bob' },
        ],
      })

      expectUnmatched(matcher(['fred', 'bob']))
    })
  })

  test('use asInternalIterator', () => {
    const matcher = group('a', 'b', 'c')
    const iterator = 'abc'.split('')

    expect(matcher(asInternalIterator(iterator))).toEqual({
      matched: true,
      value: ['a', 'b', 'c'],
      result: [
        {
          matched: true,
          value: 'a',
        },
        {
          matched: true,
          value: 'b',
        },
        {
          matched: true,
          value: 'c',
        },
      ],
    })
  })
})
