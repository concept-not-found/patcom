import {
  matcher,
  matchNumber,
  matchBigInt,
  matchString,
  matchArray,
  greaterThan,
  greaterThanEquals,
  defined,
  rest,
  oneOf,
  allOf,
  matchProp,
  when,
  otherwise,
  between,
} from '../index.js'

import { match } from './index.js'

export const AdventureCommand =
  (handleGoDir, handleTakeItem, handleOtherwise) => (command) =>
    match(command)(
      when(['go', oneOf('north', 'east', 'south', 'west')], ([, dir]) =>
        handleGoDir(dir)
      ),
      when(['take', allOf(/[a-z]+ ball/, matchProp('weight'))], ([, item]) =>
        handleTakeItem(item)
      ),
      otherwise(() => handleOtherwise())
    )

export const ArrayLength =
  (handleEmpty, handleSinglePage, handleMultiplePages, handleOtherwise) =>
  (res) =>
    match(res)(
      when({}, () => handleEmpty()),
      when({ data: [defined] }, ({ data: [page] }) => handleSinglePage(page)),
      when({ data: [defined, rest] }, ({ data: [frontPage, ...pages] }) =>
        handleMultiplePages(frontPage, pages)
      ),
      otherwise(() => handleOtherwise())
    )

function* integers(to) {
  for (var i = 1; i <= to; i++) yield i
}

export const ArrayPatternCaching = (n) => {
  const iterable = integers(n)
  match(iterable)(
    when([matchNumber()], ([a]) => console.log(`found one int: ${a}`)),
    // Matching a generator against an array pattern.
    // Obtain the iterator (which is just the generator itself),
    // then pull two items:
    // one to match against the `a` pattern (which succeeds),
    // the second to verify the iterator only has one item
    // (which fails).
    when([matchNumber(), matchNumber()], ([a, b]) =>
      console.log(`found two ints: ${a} and ${b}`)
    ),
    // Matching against an array pattern again.
    // The generator object has already been cached,
    // so we fetch the cached results.
    // We need three items in total;
    // two to check against the patterns,
    // and the third to verify the iterator has only two items.
    // Two are already in the cache,
    // so we’ll just pull one more (and fail the pattern).
    otherwise(() => console.log('more than two ints'))
  )
  console.log([...iterable])
  // logs [4, 5]
  // The match construct pulled three elements from the generator,
  // so there’s two leftover afterwards.
}

function asciiCI(str) {
  return {
    [matcher](matchable) {
      return {
        matched: str.toLowerCase() == matchable.toLowerCase(),
      }
    },
  }
}

export const AsciiCi = (cssProperty) =>
  match(cssProperty)(
    when({ name: asciiCI('color'), value: defined }, ({ value }) =>
      console.log('color: ' + value)
    )
    // matches if `name` is an ASCII case-insensitive match
    // for "color", so `{name:"COLOR", value:"red"} would match.
  )

export const AsyncMatch = async (somethingThatRejects, matchable) =>
  match(await matchable)(
    when({ a: defined }, async ({ a }) => await a),
    when({ b: defined }, ({ b }) => b.then(() => 42)),
    otherwise(async () => await somethingThatRejects())
  ) // produces a Promise

export const BuiltInCustomMatchers = (value) =>
  match(value)(
    when(matchNumber(), (value) => console.log('Number', value)),
    when(matchBigInt(), (value) => console.log('BigInt', value)),
    when(matchString(), (value) => console.log('String', value)),
    when(matchArray(), (value) => console.log('Array', value)),
    otherwise((value) => console.log('otherwise', value))
  )

export const ChainingGuards = (res) =>
  match(res)(
    when({ pages: greaterThan(1), data: defined }, () =>
      console.log('multiple pages')
    ),
    when({ pages: 1, data: defined }, () => console.log('one page')),
    otherwise(() => console.log('no pages'))
  )

export const ConditionalJsx = (h, API_URL, Fetch, Loading, Error, Page) => () =>
  h(Fetch, { url: API_URL }, (props) =>
    match(props)(
      when({ loading: defined }, () => h(Loading)),
      when({ error: defined }, ({ error }) => {
        console.err('something bad happened')
        return h(Error, { error })
      }),
      when({ data: defined }, ({ data }) => h(Page, { data }))
    )
  )

export class Foo {
  static [matcher](value) {
    return {
      matched: value instanceof Foo,
      value,
    }
  }
}

const Exception = Error

export class Option {
  constructor(hasValue, value) {
    this.hasValue = !!hasValue
    if (hasValue) {
      this._value = value
    }
  }
  get value() {
    if (this.hasValue) return this._value
    throw new Exception("Can't get the value of an Option.None.")
  }

  static Some(val) {
    return new Option(true, val)
  }
  static None() {
    return new Option(false)
  }
}

Option.Some[matcher] = (val) => ({
  matched: val instanceof Option && val.hasValue,
  value: val instanceof Option && val.hasValue && val.value,
})
Option.None[matcher] = (val) => ({
  matched: val instanceof Option && !val.hasValue,
})

export const CustomMatcherOption = (result) =>
  match(result)(
    when(Option.Some, (val) => console.log(val)),
    when(Option.None, () => console.log('none'))
  )

const RequestError = Error

export const FetchJsonResponse = async (fetch, jsonService) => {
  const res = await fetch(jsonService)
  match(res)(
    when(
      { status: 200, headers: { 'Content-Length': defined } },
      ({ headers: { 'Content-Length': s } }) => console.log(`size is ${s}`)
    ),
    when({ status: 404 }, () => console.log('JSON not found')),
    when({ status: greaterThanEquals(400) }, () => {
      throw new RequestError(res)
    })
  )
}

export const NilPattern = (someArr) =>
  match(someArr)(when([, , defined], ([, , someVal]) => console.log(someVal)))

export const ObjectPatternCaching = () => {
  const randomItem = {
    get numOrString() {
      return Math.random() < 0.5 ? 1 : '1'
    },
  }

  match(randomItem)(
    when({ numOrString: matchNumber() }, () =>
      console.log('Only matches half the time.')
    ),
    // Whether the pattern matches or not,
    // we cache the (randomItem, "numOrString") pair
    // with the result.
    when({ numOrString: matchString() }, () =>
      console.log('Guaranteed to match the other half of the time.')
    )
    // Since (randomItem, "numOrString") has already been cached,
    // we reuse the result here;
    // if it was a string for the first clause,
    // it’s the same string here.
  )
}

export const RegExpGroups = (process, handleOtherwise) => (arithmeticStr) =>
  match(arithmeticStr)(
    when(
      /(?<left>\d+) \+ (?<right>\d+)/,
      (value, { matchedRegExp: { groups: { left, right } = {} } }) =>
        process(left, right)
    ),
    when(/(\d+) \* (\d+)/, (value, { matchedRegExp: [, left, right] }) =>
      process(left, right)
    ),
    otherwise(() => handleOtherwise())
  )

export const ResHandler = (handleData, handleRedirect, retry, throwSomething) =>
  class RetryableHandler {
    constructor() {
      this.hasRetried = false
    }

    handle(req, res) {
      match(res)(
        when({ status: 200, body: defined, rest }, ({ body }, { rest }) =>
          handleData(body, rest)
        ),
        when(
          { status: between(300, 400), destination: matchString() },
          ({ destination: url }) => handleRedirect(url)
        ),
        when(
          { status: 500 },
          () => !this.hasRetried,
          () => {
            retry(req)
            this.hasRetried = true
          }
        ),
        otherwise(() => throwSomething())
      )
    }
  }

export const TodoReducer = (initialState = {}) =>
  function todosReducer(state = initialState, action) {
    return match(action)(
      when(
        { type: 'set-visibility-filter', payload: defined },
        ({ payload: visFilter }) => ({ ...state, visFilter })
      ),
      when({ type: 'add-todo', payload: defined }, ({ payload: text }) => ({
        ...state,
        todos: [...state.todos, { text, completed: false }],
      })),
      when({ type: 'toggle-todo', payload: defined }, ({ payload: index }) => {
        const newTodos = state.todos.map((todo, i) => {
          return i !== index
            ? todo
            : {
                ...todo,
                completed: !todo.completed,
              }
        })

        return {
          ...state,
          todos: newTodos,
        }
      }),
      otherwise(() => state) // ignore unknown actions
    )
  }

class MyClass {
  static [matcher](matchable) {
    return {
      matched: matchable === 3,
      value: { a: 1, b: { c: 2 } },
    }
  }
}

export const WithChainingMyClass = () =>
  match(3)(
    when(MyClass, () => true), // matches, doesn’t use the result
    when(MyClass, ({ a, b: { c } }) => {
      // passes the custom matcher,
      // then further applies an object pattern to the result’s value
      assert(a === 1)
      assert(c === 2)
    })
  )

export const WithChainingRegExp = () =>
  match('foobar')(
    when(/foo(.*)/, (value, { matchedRegExp: [, suffix] }) =>
      console.log(suffix)
    )
    // logs "bar", since the match result
    // is an array-like containing the whole match
    // followed by the groups.
    // note the hole at the start of the array matcher
    // ignoring the first item,
    // which is the entire match "foobar".
  )
