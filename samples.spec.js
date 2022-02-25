import { match, when, otherwise, defined, rest } from './index.js'

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
            headers: { rest: restOfHeaders },
          },
          rest: restOfResponse,
        }
      ) => [cookieValue, restOfHeaders, restOfResponse]
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
      expect(result).toEqual([
        'om',
        [{ name: 'accept', value: 'everybody' }],
        { status: 200 },
      ])
    })
  })
})
