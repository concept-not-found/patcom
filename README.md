# patcom

`patcom` is pattern matching JavaScript library. Build pattern matchers from simpler smaller matchers.

> Pattern matching is a declarative programming. The code matches the shape of the data.

```sh
npm install --save patcom
```

## Simple example
Let's say we have objects that represent a `Student` or a `Teacher`.
```ts
  type Student = {
    role: 'student'
  }

  type Teacher = {
    role: 'teacher',
    surname: string
  }
```

Using `patcom` we can match a `person` by their `role` to form a greeting.
```js
import {match, when, otherwise, defined} from 'patcom'

function greet(person) {
  return match (person) (
    when (
      { role: 'student' },
      () => 'Hello fellow student.'
    ),

    when (
      { role: 'teacher', surname: defined },
      ({ surname }) => `Good morning ${surname} sensei.`
    ),

    otherwise (
      () => 'STRANGER DANGER'
    )
  )
}


greet({ role: 'student' }) ≡ 'Hello fellow student.'
greet({ role: 'teacher', surname: 'Wong' }) ≡ 'Good morning Wong sensei.'
greet({ role: 'creeper' }) ≡ 'STRANGER DANGER'
```

<details>
<summary>What is <code>match</code> doing?</summary>

[`match`](#match) finds the first [`when`](#when) clause that matches, then the [`Matched`](#core-concept) object is transformed into the greeting. If none of the `when` clauses match, the [`otherwise`](#otherwise) clause always matches.
</details>

## More expressive than `switch`

Pattern match over whole objects and not just single fields.

### Imperative `switch` & `if` 😔
Oh noes, a [Pyramid of doom](https://en.wikipedia.org/wiki/Pyramid_of_doom_(programming))
```
switch (person.role) {
  case 'student':
    if (person.grade > 90) {
      return 'Gold star'
    } else if (person.grade > 60) {
      return 'Keep trying'
    } else {
      return 'See me after class'
    }
  default:
      throw new Exception(`expected student, but got ${person}`)
}
```

### Declarative `match` 🙂
Flatten Pyramid to linear cases.
```js
return match (person) (
  when (
    { role: 'student', grade: greaterThan(90) },
    () => 'Gold star'
  ),

  when (
    { role: 'student', grade: greaterThan(60) },
    () => 'Keep trying'
  ),

  when (
    { role: 'student', grade: defined },
    () => 'See me after class'
  ),

  otherwise (
    (person) => throw new Exception(`expected student, but got ${person}`)
  )
)
```
<details>
<summary>What is <code>greaterThan</code>?</summary>

[`greaterThan`](#greaterthan) is a [`Matcher`](#core-concept) provided by `patcom`. `greaterThan(90)` means "match a number greater than 90".
</details>

## Match `Array`, `String`, `RegExp` and more
### Arrays
```js
match (list) (
  when (
    [],
    () => 'empty list'
  ),

  when (
    [defined],
    ([head]) => `single item ${head}`
  ),

  when (
    [defined, rest],
    ([head, ...tail]) => `multiple items`
  )
)
```
<details>
<summary>What is <code>rest</code>?</summary>

[`rest`](#rest) is a special [`Matcher`](#core-concept) used within array and object patterns. Array and objects are complete matches and the `rest` pattern consumes all remaining values.
</details>

### `String` & `RegExp`
```js
match (command) (
  when (
    'sit',
    () => sit()
  ),

  // matchedRegExp is the RegExp match result
  when (
    /^move (\d) spaces$/,
    (value, { matchedRegExp: [, distance] }) => move(distance)
  ),

  // ...which means matchedRegExp has the named groups
  when (
    /^eat (?<food>\w+)$/,
    (value, { matchedRegExp: { groups: { food } } }) => eat(food)
  )
)
```

### `Number`, `BigInt` & `Boolean`
```js
match (value) (
  when (
    69,
    () => 'nice'
  ),

  when (
    69n,
    () => 'big nice'
  ),

  when (
    true,
    () => 'not nice'
  )
)
```

## Match complex data structures
```js
match (complex) (
  when (
    { schedule: [{ class: 'history', rest }, rest] },
    () => 'history first thing on schedule? buy coffee'
  ),

  when (
    { schedule: [{ professor: oneOf('Ko', 'Smith'), rest }, rest] },
    ({ schedule: [{ professor }] }) => `Professor ${professor} teaching? bring voice recorder`
  )
)
```

### Matchers are extractable
From the previous example, complex patterns can be broken down to simpler reusable matchers.
```js
const fastSpeakers = oneOf('Ko', 'Smith')

match (complex) (
  when (
    { schedule: [{ class: 'history', rest }, rest] },
    () => 'history first thing on schedule? buy coffee'
  ),

  when (
    { schedule: [{ professor: fastSpeakers, rest }, rest] },
    ({ schedule: [{ professor }] }) => `Professor ${professor} teaching? bring voice recorder`
  )
)
```

## Custom matchers
Define custom matchers with any logic. [`Matcher`](#core-concept)s are simply functions that take in a `value` and returns a [`Result`](#core-concept). Either the `value` is [`Matched`](#core-concept) or is [`Unmatched`](#core-concept).

```js
function matchDuck(value) {
  if (value.type === 'duck') {
    return {
      matched: true,
      value
    }
  }
  return {
    matched: false
  }
}

...

function speak(animal) {
  return match (animal) (
    when (
      matchDuck,
      () => 'quack'
    ),

    when (
      matchDragon,
      () => 'rawr'
    )
  )
)
```

All the examples thus far have been using [`match`](#match), but `match` itself isn't a matcher. In order to use `speak` in another pattern, we use [`oneOf`](#oneof) instead.

```js
const speakMatcher = oneOf (
  when (
    matchDuck,
    () => 'quack'
  ),

  when (
    matchDragon,
    () => 'rawr'
  )
)
```

Now upon unrecognized animals, whereas `speak` previously returned `undefined`, `speakMatcher` now returns `{ matched: false }`. This allows us to combine `speakMatcher` with other patterns.

```js
match (animal) (
  when (
    speakMatcher,
    (sound) => `the ${animal.type} goes ${sound}`
  ),

  otherwise(
    () => `the ${animal.type} remains silent`
  )
)
```

Everything except for `match` is actually a [`Matcher`](#core-concept), including `when` and `otherwise`. Primative value and data types are automatically converted to a corresponding matcher.

```js
when ({ role: 'student' }, ...) ≡
when (matchObject({ role: 'student' }), ...)

when ([defined], ...) ≡
when (matchArray([defined]), ...)

when ('sit', ...) ≡
when (matchString('sit'), ...)

when (/^move (\d) spaces$/, ...) ≡
when (matchRegExp(/^move (\d) spaces$/), ...)

when (69, ...) ≡
when (matchNumber(69), ...)

when (69n, ...) ≡
when (matchBigInt(69n), ...)

when (true, ...) ≡
when (matchBoolean(true), ...)
```

Even the complex patterns are composed of simpler matchers.
### Primatives
```js
when (
  {
    schedule: [
      { class: 'history', rest },
      rest
    ]
  },
  ...
)
```
### Equivalent explict matchers
```js
when (
  matchObject({
    schedule: matchArray([
      matchObject({ class: matchString('history'), rest }),
      rest
    ])
  }),
  ...
)
```

## Core concept
At the heart of `patcom`, everything is built around a single concept, the `Matcher`. The `Matcher` takes any `value` and returns a `Result`, which is either `Matched` or `Unmatched`.

```ts
type Matcher<T> = (value: any) => Result<T>

type Result<T> = Matched<T> | Unmatched

type Matched<T> = {
  matched: true,
  value: T
}

type Unmatched = {
  matched: false
}
```

### Built-in `Matcher`s
Directly useable `Matcher`s.
- #### `any`
  ```ts
  const any: Matcher<any>
  ```
  Matches for any value, including `undefined`.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = any

  matcher(undefined) ≡ { matched: true, value: undefined }
  matcher({ key: 'value'}) ≡ { matched: true, value: {key: 'value' } }
  ```
  </details>

- #### `defined`
  ```ts
  const defined: Matcher<any>
  ```
  Matches for any defined value, or in other words not `undefined`.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = defined

  matcher({ key: 'value' }) ≡ { matched: true, value: {key: 'value' } }

  matcher(undefined) ≡ { matched: false }
  ```
  </details>

- #### `empty`
  ```ts
  const empty: Matcher<[] | {} | ''>
  ```
  Matches either `[]`, `{}`, or `''` (empty string).
  <details>
  <summary>Example</summary>

  ```js
  const matcher = empty

  matcher([]) ≡ { matched: true, value: [] }
  matcher({}) ≡ { matched: true, value: {} }
  matcher('') ≡ { matched: true, value: '' }

  matcher([42]) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  matcher('alice') ≡ { matched: false }
  ```
  </details>

### `Matcher` builders
Builders to create a `Matcher`.
- #### `between`
  ```ts
  function between(lower: number, upper: number): Matcher<number>
  ```
  Matches if value is a `Number`, where `lower <= value < upper`
  <details>
  <summary>Example</summary>

  ```js
  const matcher = between(10, 20)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(19) ≡ { matched: true, value: 19 }
  matcher(20) ≡ { matched: false }
  ```
  </details>

- #### `equals`
  ```ts
  function equals<T>(expected: T): Matcher<T>
  ```
  Matches `expected` if strictly equals `===` to value.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = equals('alice')

  matcher('alice') ≡ { matched: true, value: 'alice' }
  matcher(42) ≡ { matched: false }
  ```
  ```js
  const matcher = equals(42)

  matcher('alice') ≡ { matched: false }
  matcher(42) ≡ { matched: true, value: 42 }
  ```
  </details>

- #### `greaterThan`
  ```ts
  function greaterThan(expected: number): Matcher<number>
  ```
  Matches if value is a `Number`, where `expected < value`
  <details>
  <summary>Example</summary>

  ```js
  const matcher = greaterThan(10)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: false }
  matcher(11) ≡ { matched: true, value: 11 }
  ```
  </details>

- #### `greaterThanEquals`
  ```ts
  function greaterThanEquals(expected: number): Matcher<number>
  ```
  Matches if value is a `Number`, where `expected <= value`
  <details>
  <summary>Example</summary>

  ```js
  const matcher = greaterThanEquals(10)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(11) ≡ { matched: true, value: 11 }
  ```
  </details>

- #### `lessThan`
  ```ts
  function lessThan(expected: number): Matcher<number>
  ```
  Matches if value is a `Number`, where `expected > value`
  <details>
  <summary>Example</summary>

  ```js
  const matcher = lessThan(10)

  matcher(9) ≡ { matched: true, value: 9 }
  matcher(10) ≡ { matched: false }
  matcher(11) ≡ { matched: false }
  ```
  </details>

- #### `lessThanEquals`
  ```ts
  function lessThanEquals(expected: number): Matcher<number>
  ```
  Matches if value is a `Number`, where `expected >= value`
  <details>
  <summary>Example</summary>

  ```js
  const matcher = lessThanEquals(10)

  matcher(9) ≡ { matched: true, value: 9 }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(11) ≡ { matched: false }
  ```
  </details>

- #### `matchPredicate`
  ```ts
  function matchPredicate<T>(predicate: () => Boolean): Matcher<T>
  ```
  Matches value that satisfies the predicate, or in other words `predicate(value) === true`
  <details>
  <summary>Example</summary>

  ```js
  const isEven = (x) => x % 2 === 0
  const matcher = matchPredicate(isEven)

  matcher(2) ≡ { matched: true, value: 2 }

  matcher(1) ≡ { matched: false }
  ```
  </details>

- #### `matchBigInt`
  ```ts
  function matchBigInt(expected?: bigint): Matcher<bigint>
  ```
  Matches if value is the `expected` BigInt. Matches any defined BigInt if `expected` is not provided.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchBigInt(42n)

  matcher(42n) ≡ { matched: true, value: 42n }

  matcher(69n) ≡ { matched: false }
  matcher(42) ≡ { matched: false }
  ```
  ```js
  const matcher = matchBigInt()

  matcher(42n) ≡ { matched: true, value: 42n }
  matcher(69n) ≡ { matched: true, value: 69n }

  matcher(42) ≡ { matched: false }
  ```
  </details>

- #### `matchNumber`
  ```ts
  function matchNumber(expected?: number): Matcher<number>
  ```
  Matches if value is the `expected` `Number`. Matches any defined `Number` if `expected` is not provided.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchNumber(42)

  matcher(42) ≡ { matched: true, value: 42 }

  matcher(69) ≡ { matched: false }
  matcher(42n) ≡ { matched: false }
  ```
  ```js
  const matcher = matchNumber()

  matcher(42) ≡ { matched: true, value: 42 }
  matcher(69) ≡ { matched: true, value: 69 }

  matcher(42n) ≡ { matched: false }
  ```
  </details>

- #### `matchProp`
  ```ts
  function matchProp(expected: string): Matcher<string>
  ```
  Matches if value has `expected` as a property key, or in other words `expected in value`.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchProp('x')

  matcher({ x: 42 }) ≡ { matched: true, value: { x: 42 } }

  matcher({ y: 42 }) ≡ { matched: false }
  matcher({}) ≡ { matched: false }
  ```
  </details>

- #### `matchString`
  ```ts
  function matchString(expected?: string): Matcher<string>
  ```
  Matches if value is the `expected` `String`. Matches any defined `String` if `expected` is not provided.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchString('alice')

  matcher('alice') ≡ { matched: true, value: 'alice' }

  matcher('bob') ≡ { matched: false }
  ```
  ```js
  const matcher = matchString()

  matcher('alice') ≡ { matched: true, value: 'alice' }

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```
  </details>

- #### `matchRegExp`
  ```ts
  function matchRegExp(expected: RegExp): Matcher<string>
  ```
  Matches if value matches the `expected` `RegExp`. `Matched` will include the `RegExp` match object as the `matchedRegExp` property.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchRegExp(/^dear (\w+)$/)

  matcher('dear alice') ≡ { matched: true, value: 'dear alice', matchedRegExp: ['dear alice', 'alice'] }

  matcher('hello alice') ≡ { matched: false }
  ```
  ```js
  const matcher = matchRegExp(/^dear (?<name>\w+)$/)

  matcher('dear alice') ≡ { matched: true, value: 'dear alice', matchedRegExp: { groups: { name: 'alice' } } }

  matcher('hello alice') ≡ { matched: false }
  ```
  </details>


### `Matcher` composers
Creates a `Matcher` from other `Matcher`s.
- #### `matchArray`
  ```ts
  function matchArray<T>(expected?: T[]): Matcher<T[]>
  ```
  Matches `expected` array until end or [`rest`](#rest) matcher. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Rest of properties grouped into the `rest` property on the matched result. Matches any defined array if `expected` is not provided.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchArray([42, 'alice'])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    results: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ]
  }

  matcher([42, 'alice', true, 69]) ≡ { matched: false }
  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```
  ```js
  const matcher = matchArray([42, 'alice', rest])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    results: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ],
    rest: []
  }
  matcher([42, 'alice', true, 69]) ≡ {
    matched: true,
    value: [42, 'alice', true, 69],
    results: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ],
    rest: [true, 69]
  }

  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```
  ```js
  const matcher = matchArray()

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    results: []
  }

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```
  </details>

- #### `matchObject`
  ```ts
  function matchObject<T>(expected?: T): Matcher<T>
  ```
  Matches `expected` enumerable object properties completely or partially with [`rest`](#rest) matcher. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Rest of properties grouped into the `rest` property on the matched result. Matches any defined object if `expected` is not provided.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = matchObject({ x: 42, y: 'alice' })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    }
  }
  matcher({ y: 'alice', x: 42 }) ≡ {
    matched: true,
    value: { y: 'alice', x: 42 },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    }
  }

  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ { matched: false }
  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', rest })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    },
    rest: {}
  }
  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', z: true, aa: 69 },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    },
    rest: { z: true, aa: 69 }
  }

  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```
  ```js
  const matcher = matchObject()

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    results: {}
  }

  matcher(undefined) ≡ { matched: false }
  matcher('alice') ≡ { matched: false }
  ```
  </details>

- #### `not`
  ```ts
  function not<T>(unexpected: T): Matcher<T>
  ```
  Matches if value does not match `unexpected`. Primatives in `unexpected` are wrapped with their corresponding `Matcher` builder
  <details>
  <summary>Example</summary>

  ```js
  const matcher = not(oneOf('alice', 'bob'))

  matcher('eve') ≡ { matched: true, value: 'eve' }

  matcher('alice') ≡ { matched: false }
  matcher('bob') ≡ { matched: false }
  ```
  </details>

- #### `rest`
  ```ts
  const res: Matcher<any>
  ```
  A special `Matcher` that is only valid as element of [`matchArray`](#matcharray) or property of [`matchObject`](#matchobject). This consumes the remaining elements/properties to prefix matching of arrays and partial matching of objects.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = when(
    {
      headers: [
        { name: 'cookie', value: defined },
        rest
      ],
      rest
    },
    (
      { headers: [{ value: cookieValue }] },
      { results: { headers: { rest: restOfHeaders } }, rest: restOfResponse }
    ) => ({
      cookieValue,
      restOfHeaders,
      restOfResponse
    })
  )

  matcher({
    status: 200,
    headers: [
      { name: 'cookie', value: 'om' },
      { name: 'accept', value: 'everybody' }
    ]
  }) ≡ {
    cookieValue: 'om',
    restOfHeaders: [{ name: 'accept', value: 'everybody' }],
    restOfResponse: { status: 200 }
  }

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```
  ```js
  const matcher = matchArray([42, 'alice', rest])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    results: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ],
    rest: []
  }
  matcher([42, 'alice', true, 69]) ≡ {
    matched: true,
    value: [42, 'alice', true, 69],
    results: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ],
    rest: [true, 69]
  }

  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', rest })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    },
    rest: {}
  }
  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', z: true, aa: 69 },
    results: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    },
    rest: { z: true, aa: 69 }
  }

  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```
  </details>

- #### `allOf`
  ```ts
  function allOf<T>(expected: ...T): Matcher<T>
  ```
  Matches if all `expected` matchers are matched. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Always matches if `expected` is empty.
  <details>
  <summary>Example</summary>

  ```js
  const isEven = (x) => x % 2 === 0
  const matchEven = matchPredicate(isEven)

  const matcher = allOf(between(1, 10), matchEven)

  matcher(2) ≡ {
    matched: true,
    value: 2,
    results: [
      { matched: true, value: 2 },
      { matched: true, value: 2 }
    ]
  }

  matcher(0) ≡ { matched: false }
  matcher(1) ≡ { matched: false }
  matcher(12) ≡ { matched: false }
  ```
  ```js
  const matcher = allOf()

  matcher(undefined) ≡ { matched: true, value: undefined, results: [] }
  matcher({ key: 'value' }) ≡ { matched: true, value: { key: 'value' }, results: [] }
  ```
  </details>

- #### `oneOf`
  ```ts
  function oneOf<T>(expected: ...T): Matcher<T>
  ```
  Matches first `expected` matcher that matches. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Always unmatched when empty `expected`. Similar to [`match`](#match).
  <details>
  <summary>Example</summary>

  ```js
  const matcher = oneOf('alice', 'bob')

  matcher('alice') ≡ { matched: true, value: 'alice' }
  matcher('bob') ≡ { matched: true, value: 'bob' }

  matcher('eve') ≡ { matched: false }
  ```
  ```js
  const matcher = oneOf()

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```
  </details>

- #### `when`
  ```ts
  type ValueMapper<T, R> = (value: T, matched: Matched<T>) => R

  function when<T, R>(
    expected?: T,
    ...guards: ValueMapper<T, Boolean>,
    valueMapper: ValueMapper<T, R>
  ): Matcher<R>
  ```
  Matches if `expected` matches and satifies all the `guards`, then matched value is transformed with `valueMapper`. `guards` are optional. Primative `expected` are wrapped with their corresponding `Matcher` builder. Second parameter to `valueMapper` is the `Matched` `Result`. See [`matchRegExp`](#matchregexp) and [`rest`](#rest) for extra fields on `Matched`.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = when(
    { role: 'teacher', surname: defined },
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong',
    results: {
      role: { matched: true, value: 'teacher' },
      surname: { matched: true, value: 'Wong' }
    }
  }

  matcher({ role: 'student' }) ≡ { matched: false }
  ```
  ```js
  const matcher = when(
    { role: 'teacher', surname: defined },
    ({ surname }) => surname.length === 4, // guard
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong',
    results: {
      role: { matched: true, value: 'teacher' },
      surname: { matched: true, value: 'Wong' }
    }
  }

  matcher({ role: 'teacher', surname: 'Smith' }) ≡ { matched: false }
  ```
  </details>

- #### `otherwise`
  ```ts
  type ValueMapper<T, R> = (value: T, matched: Matched<T>) => R

  function otherwise<T, R>(
    ..guards: ValueMapper<T, Boolean>,
    valueMapper: ValueMapper<T, R>
  ): Matcher<R>
  ```
  Matches if satifies all the `guards`, then value is transformed with `valueMapper`. `guards` are optional.
  <details>
  <summary>Example</summary>

  ```js
  const matcher = otherwise(
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong'
  }
  ```
  ```js
  const matcher = otherwise(
    ({ surname }) => surname.length === 4, // guard
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong'
  }

  matcher({ role: 'teacher', surname: 'Smith' }) ≡ { matched: false }
  ```
  </details>

### `Matcher` consumers
- #### `match`
  ```ts
  const match<T, R>: (value: T) => (...clauses: Matcher<R>) => R | undefined
  ```
  Returns a matched value for the first clause that matches, or `undefined` if all are unmatched. `match` is to be used as a top level expression and is not composable. To create a matcher composed of clauses use [`oneOf`](#oneof).
  <details>
  <summary>Example</summary>

  ```js
  function meme(value) {
    return match (value) (
      when (69, () => 'nice'),
      otherwise (() => 'meh')
    )
  }

  meme(69) ≡ 'nice'
  meme(42) ≡ 'meh'
  ```
  ```js
  function meme(value) {
    return match (value) (
      when (69, () => 'nice')
    )
  }

  meme(69) ≡ 'nice'
  meme(42) ≡ undefined

  const memeMatcher = oneOf (
    when (69, () => 'nice')
  )

  memeMatcher(69) ≡ { matched: true, value: 'nice' }
  memeMatcher(42) ≡ { matched: false }
  ```
  </details>

## What about [TC39 pattern matching proposal](https://github.com/tc39/proposal-pattern-matching)?

`patcom` is does not implement the semantics of TC39 pattern matching proposal. However, `patcom` was inspired from TC39 pattern matching proposal and in-fact has feature parity. As `patcom` is a JavaScript library, it cannot introduce any new syntax, but the syntax remains relatively similar.

### Comparision of TC39 pattern matching proposal on left to `patcom` on right
![tc39 comparision](./tc39-proposal-pattern-matching/diff.png)

### Differences
The most notable different is `patcom` implemented [enumerable object properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) matching, where as TC39 pattern matching proposal implements partial object matching. See https://github.com/tc39/proposal-pattern-matching/issues/243. The [`rest`](#rest) matcher can be used to achieve partial object matching.

Since `patcom` had to separate the pattern matching from destructuring, enumerable object properties matching is the most sensible. Syntactically separation of the pattern from destructuring is the biggest difference.

#### TC39 pattern matching proposal syntax shape
```js
when (pattern + destructuring assignment) if guard:
  expression using assignments
```
#### `patcom` syntax shape
```js
when (pattern, ...guards, (destructuring assignment) =>
  expression using assignments
)
```

`patcom` offers `allOf` and `oneOf` matchers as subsitute for the [pattern combinators](https://github.com/tc39/proposal-pattern-matching#pattern-combinators) syntax.

Additional consequence of the separating the pattern from destructuring is `patcom` has no need for any of:
- [interpolation pattern](https://github.com/tc39/proposal-pattern-matching#interpolation-pattern) syntax
- [custom matcher protocol interpolations](https://github.com/tc39/proposal-pattern-matching#custom-matcher-protocol-interpolations) syntax
- [`with` chaining](https://github.com/tc39/proposal-pattern-matching#with-chaining) syntax.

Another difference is TC39 pattern matching proposal caches iterators and object property accesses. This has been implemented in `patcom` as a different variation of `match`, which is powered by `cachingOneOf`.

To see a full comparsion with TC39 pattern matching proposal and unit tests to prove full feature parity, see [tc39-proposal-pattern-matching folder](./tc39-proposal-pattern-matching).

## What about [`match-iz`](https://github.com/shuckster/match-iz)?
`match-iz` is similarly insprired by TC39 pattern matching proposal has has many similaries to `patcom`. However, `match-iz` is not feature complete to TC39 pattern matching proposal, most notably missing is:
- when guards
- caching iterators and object property accesses

`match-iz` also offers a different match result API, where `matched` and and `value` are allowed to be functions. The same functionality in `patcom` can be found in the form of [functional mappers](./mappers.js).

## Contributions welcome
The following is a non-exhaustive list of features which could be implemented in the feature
- more unit testing
- richer set of matchers
  - as this library exports modules, the size of the npm package does not matter if consumed by a tree shaking bundler. this means matchers of any size will be accepted as long as all matchers can be organized well as a cohesive set
  - [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) matcher
  - [Temporal](https://github.com/tc39/proposal-temporal) matchers
  - [Typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#indexed_collections) matchers
  - [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) matcher
  - [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) matcher
  - [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) matchers
  - [Dom](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) matchers
  - other [Web API](https://developer.mozilla.org/en-US/docs/Web/API) matchers
- eslint
- typescript, either by rewrite or `.d.ts` files
- async matchers
