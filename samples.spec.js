import { expectUnmatched } from './matchers/test-utils.js'
import {
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
      (
        { headers: [{ value: cookieValue }] },
        {
          results: {
            headers: {
              results: [, { value: restOfHeaders }],
            },
            rest: { value: restOfResponse },
          },
        }
      ) => ({ cookieValue, restOfHeaders, restOfResponse })
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
        value: [42, 'alice'],
        results: [
          { matched: true, value: 42 },
          { matched: true, value: 'alice' },
          { matched: true, value: [] },
        ],
      })
      expect(matcher([42, 'alice', true, 69])).toEqual({
        matched: true,
        value: [42, 'alice', true, 69],
        results: [
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
        value: { x: 42, y: 'alice' },
        results: {
          x: { matched: true, value: 42 },
          y: { matched: true, value: 'alice' },
          rest: { matched: true, value: {} },
        },
      })
      expect(matcher({ x: 42, y: 'alice', z: true, aa: 69 })).toEqual({
        matched: true,
        value: { x: 42, y: 'alice', z: true, aa: 69 },
        results: {
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
        value: { x: 42, y: 'alice', z: true },
        results: {
          x: { matched: true, value: 42 },
          y: { matched: true, value: 'alice' },
          customRestKey: { matched: true, value: { z: true } },
        },
      })
    })
  })

  test('maybe example', () => {
    const matcher = matchArray([maybe('alice'), 'bob'])

    expect(matcher(['alice', 'bob'])).toEqual({
      matched: true,
      value: ['alice', 'bob'],
      results: [
        {
          matched: true,
          value: ['alice'],
          result: { matched: true, value: 'alice' },
        },
        { matched: true, value: 'bob' },
      ],
    })
    expect(matcher(['bob'])).toEqual({
      matched: true,
      value: ['bob'],
      results: [
        { matched: true, value: [] },
        { matched: true, value: 'bob' },
      ],
    })

    expectUnmatched(matcher(['eve', 'bob']))
    expectUnmatched(matcher(['eve']))
  })

  test('some example', () => {
    const matcher = matchArray([some('alice'), 'bob'])

    expect(matcher(['alice', 'alice', 'bob'])).toEqual({
      matched: true,
      value: ['alice', 'alice', 'bob'],
      results: [
        {
          matched: true,
          value: ['alice', 'alice'],
          results: [
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
})
