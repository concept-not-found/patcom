# patcom

`patcom` is a pattern-matching JavaScript library. Build pattern matchers from simpler, smaller matchers.

> Pattern-matching uses declarative programming. The code matches the shape of the data.

```sh
npm install --save patcom
```

## Simple example

Let's say we have objects that represent a `Student` or a `Teacher`.

<!-- prettier-ignore -->
```ts
  type Student = {
    role: 'student'
  }

  type Teacher = {
    role: 'teacher',
    surname: string
  }
```

Using `patcom`, we can match a `person` by their `role` to form a greeting.

<!-- prettier-ignore -->
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

Oh noes, a [Pyramid of doom](<https://en.wikipedia.org/wiki/Pyramid_of_doom_(programming)>)

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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
    ([head, tail]) => `multiple items`
  )
)
```

<details>
<summary>What is <code>rest</code>?</summary>

[`rest`](#rest) is an [`IteratorMatcher`](#core-concept) used within array and object patterns. Array and objects are complete matches, and the `rest` pattern consumes all remaining values.

</details>

### `String` & `RegExp`

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

From the previous example, complex patterns can be broken down into simpler reusable matchers.

<!-- prettier-ignore -->
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

Define custom matchers with any logic. [`ValueMatcher`](#core-concept) is a helper function to define custom matchers. It wraps a function that takes in a `value` and returns a [`Result`](#core-concept). Either the `value` becomes [`Matched`](#core-concept) or is [`Unmatched`](#core-concept).

<!-- prettier-ignore -->
```js
const matchDuck = ValueMatcher((value) => {
  if (value.type === 'duck') {
    return {
      matched: true,
      value
    }
  }
  return {
    matched: false
  }
})

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

<!-- prettier-ignore -->
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

Now upon unrecognized animals, whereas `speak` previously returned `undefined`, `speakMatcher` returns `{ matched: false }`. This allows us to combine `speakMatcher` with other patterns.

<!-- prettier-ignore -->
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

Everything except for `match` is actually a [`Matcher`](#core-concept), including `when` and `otherwise`. Primitive value and data types are automatically converted to a corresponding matcher.

<!-- prettier-ignore -->
```js
when ({ role: 'student' }, ...) ≡
when (matchObject({ role: 'student' }), ...)

when (['alice'], ...) ≡
when (matchArray(['alice']), ...)

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

### Primitives

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
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

At the heart of `patcom`, everything is built around a single concept, the `Matcher`. The `Matcher` takes any `value` and returns a `Result`, which is either `Matched` or `Unmatched`. Internally, the `Matcher` consumes a `TimeJumpIterator` to allow for lookahead.

Custom matchers are easily implemented using the `ValueMatcher` helper function. It removes the need to handle the internals of `TimeJumpIterator`.

<!-- prettier-ignore -->
```ts
type Matcher<T> = (value: TimeJumpIterator<any> | any) => Result<T>

function ValueMatcher<T>(fn: (value: any) => Result<T>): Matcher<T>

type Result<T> = Matched<T> | Unmatched

type Matched<T> = {
  matched: true,
  value: T
}

type Unmatched = {
  matched: false
}
```

For more advanced use cases, the `IteratorMatcher` helper function is used to create `Matcher`s that directly handle the internals of `TimeJumpIterator` but do not need to be concerned with a plain `value` being passed in.

The `TimeJumpIterator` works like a normal `Iterator`, except it can jump back to a previous state. This is useful for `Matcher`s that require lookahead. For example, the [`maybe`](#maybe) matcher would remember the starting position with `const start = iterator.now`, look ahead to see if there is a match, and if it fails, jumps the iterator back using `iterator.jump(start)`. This prevents the iterator from being consumed. If the iterator is consumed during the lookahead and left untouched on unmatched, subsequent matchers will fail to match as they would never see the values that were consumed by the lookahead.

<!-- prettier-ignore -->
```ts
function IteratorMatcher<T>(fn: (value: TimeJumpIterator<any>) => Result<T>): Matcher<T>

type TimeJumpIterator<T> = Iterator<T> & {
  readonly now: number,
  jump(time: number): void
}
```

Use the `asInternalIterator` to pass an existing iterator into a `Matcher`.

<!-- prettier-ignore -->
```ts
const matcher = group('a', 'b', 'c')

matcher(asInternalIterator('abc')) ≡ {
  matched: true,
  value: ['a', 'b', 'c'],
  result: [
    { matched: true, value: 'a' },
    { matched: true, value: 'b' },
    { matched: true, value: 'c' }
  ]
}
```

### Built-in `Matcher`s

Directly useable `Matcher`s.

- #### `any`

  <!-- prettier-ignore -->
  ```ts
  const any: Matcher<any>
  ```

  Matches for any value, including `undefined`.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = any

  matcher(undefined) ≡ { matched: true, value: undefined }
  matcher({ key: 'value' }) ≡ { matched: true, value: { key: 'value' } }
  ```

  </details>

- #### `defined`

  <!-- prettier-ignore -->
  ```ts
  const defined: Matcher<any>
  ```

  Matches for any defined value, or in other words not `undefined`.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = defined

  matcher({ key: 'value' }) ≡ { matched: true, value: {key: 'value' } }

  matcher(undefined) ≡ { matched: false }
  ```

  </details>

- #### `empty`

  <!-- prettier-ignore -->
  ```ts
  const empty: Matcher<[] | {} | ''>
  ```

  Matches either `[]`, `{}`, or `''` (empty string).
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
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

  <!-- prettier-ignore -->
  ```ts
  function between(lower: number, upper: number): Matcher<number>
  ```

  Matches if value is a `Number`, where `lower <= value < upper`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = between(10, 20)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(19) ≡ { matched: true, value: 19 }
  matcher(20) ≡ { matched: false }
  ```

  </details>

- #### `equals`

  <!-- prettier-ignore -->
  ```ts
  function equals<T>(expected: T): Matcher<T>
  ```

  Matches `expected` if strictly equals `===` to value.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = equals('alice')

  matcher('alice') ≡ { matched: true, value: 'alice' }
  matcher(42) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = equals(42)

  matcher('alice') ≡ { matched: false }
  matcher(42) ≡ { matched: true, value: 42 }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = equals(undefined)

  matcher(undefined) ≡ { matched: true, value: undefined }
  matcher(42) ≡ { matched: false }
  ```

  </details>

- #### `greaterThan`

  <!-- prettier-ignore -->
  ```ts
  function greaterThan(expected: number): Matcher<number>
  ```

  Matches if value is a `Number`, where `expected < value`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = greaterThan(10)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: false }
  matcher(11) ≡ { matched: true, value: 11 }
  ```

  </details>

- #### `greaterThanEquals`

  <!-- prettier-ignore -->
  ```ts
  function greaterThanEquals(expected: number): Matcher<number>
  ```

  Matches if value is a `Number`, where `expected <= value`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = greaterThanEquals(10)

  matcher(9) ≡ { matched: false }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(11) ≡ { matched: true, value: 11 }
  ```

  </details>

- #### `lessThan`

  <!-- prettier-ignore -->
  ```ts
  function lessThan(expected: number): Matcher<number>
  ```

  Matches if value is a `Number`, where `expected > value`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = lessThan(10)

  matcher(9) ≡ { matched: true, value: 9 }
  matcher(10) ≡ { matched: false }
  matcher(11) ≡ { matched: false }
  ```

  </details>

- #### `lessThanEquals`

  <!-- prettier-ignore -->
  ```ts
  function lessThanEquals(expected: number): Matcher<number>
  ```

  Matches if value is a `Number`, where `expected >= value`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = lessThanEquals(10)

  matcher(9) ≡ { matched: true, value: 9 }
  matcher(10) ≡ { matched: true, value: 10 }
  matcher(11) ≡ { matched: false }
  ```

  </details>

- #### `matchPredicate`

  <!-- prettier-ignore -->
  ```ts
  function matchPredicate<T>(predicate: (value: any) => Boolean): Matcher<T>
  ```

  Matches value that satisfies the predicate, or in other words `predicate(value) === true`
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const isEven = (x) => x % 2 === 0
  const matcher = matchPredicate(isEven)

  matcher(2) ≡ { matched: true, value: 2 }

  matcher(1) ≡ { matched: false }
  ```

  </details>

- #### `matchBigInt`

  <!-- prettier-ignore -->
  ```ts
  function matchBigInt(expected?: bigint): Matcher<bigint>
  ```

  Matches if value is the `expected` BigInt. Matches any defined BigInt if `expected` is not provided.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchBigInt(42n)

  matcher(42n) ≡ { matched: true, value: 42n }

  matcher(69n) ≡ { matched: false }
  matcher(42) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchBigInt()

  matcher(42n) ≡ { matched: true, value: 42n }
  matcher(69n) ≡ { matched: true, value: 69n }

  matcher(42) ≡ { matched: false }
  ```

  </details>

- #### `matchNumber`

  <!-- prettier-ignore -->
  ```ts
  function matchNumber(expected?: number): Matcher<number>
  ```

  Matches if value is the `expected` `Number`. Matches any defined `Number` if `expected` is not provided.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchNumber(42)

  matcher(42) ≡ { matched: true, value: 42 }

  matcher(69) ≡ { matched: false }
  matcher(42n) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchNumber()

  matcher(42) ≡ { matched: true, value: 42 }
  matcher(69) ≡ { matched: true, value: 69 }

  matcher(42n) ≡ { matched: false }
  ```

  </details>

- #### `matchProp`

  <!-- prettier-ignore -->
  ```ts
  function matchProp(expected: string): Matcher<string>
  ```

  Matches if value has `expected` as a property key, or in other words `expected in value`.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchProp('x')

  matcher({ x: 42 }) ≡ { matched: true, value: { x: 42 } }

  matcher({ y: 42 }) ≡ { matched: false }
  matcher({}) ≡ { matched: false }
  ```

  </details>

- #### `matchString`

  <!-- prettier-ignore -->
  ```ts
  function matchString(expected?: string): Matcher<string>
  ```

  Matches if value is the `expected` `String`. Matches any defined `String` if `expected` is not provided.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchString('alice')

  matcher('alice') ≡ { matched: true, value: 'alice' }

  matcher('bob') ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchString()

  matcher('alice') ≡ { matched: true, value: 'alice' }

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```

  </details>

- #### `matchRegExp`

  <!-- prettier-ignore -->
  ```ts
  function matchRegExp(expected: RegExp): Matcher<string>
  ```

  Matches if value matches the `expected` `RegExp`. `Matched` will include the `RegExp` match object as the `matchedRegExp` property.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchRegExp(/^dear (\w+)$/)

  matcher('dear alice') ≡ { matched: true, value: 'dear alice', matchedRegExp: ['dear alice', 'alice'] }

  matcher('hello alice') ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchRegExp(/^dear (?<name>\w+)$/)

  matcher('dear alice') ≡ { matched: true, value: 'dear alice', matchedRegExp: { groups: { name: 'alice' } } }

  matcher('hello alice') ≡ { matched: false }
  ```

  </details>

### `Matcher` composers

Creates a `Matcher` from other `Matcher`s.

- #### `matchArray`

  <!-- prettier-ignore -->
  ```ts
  function matchArray<T>(expected?: T[]): Matcher<T[]>
  ```

  Matches `expected` array completely. Primitives in `expected` are wrapped with their corresponding `Matcher` builder. `expected` array can also include [`IteratorMatcher`](#core-concept)s which can consume multiple elements. Matches any defined array if `expected` is not provided.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([42, 'alice'])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    result: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' }
    ]
  }

  matcher([42, 'alice', true, 69]) ≡ { matched: false }
  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([42, 'alice', rest])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice', []],
    result: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' },
      { matched: true, value: [] }
    ]
  }
  matcher([42, 'alice', true, 69]) ≡ {
    matched: true,
    value: [42, 'alice', [true, 69]],
    result: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' },
      { matched: true, value: [true, 69] }
    ]
  }

  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([maybe('alice'), 'bob'])

  matcher(['alice', 'bob']) ≡ {
    matched: true,
    value: ['alice', 'bob'],
    result: [
      { matched: true, value: 'alice' },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['bob']) ≡ {
    matched: true,
    value: [undefined, 'bob'],
    result: [
      { matched: true, value: undefined },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['eve', 'bob']) ≡ { matched: false }
  matcher(['eve']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([some('alice'), 'bob'])

  matcher(['alice', 'alice', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'alice'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'alice'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'alice' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['eve', 'bob']) ≡ { matched: false }
  matcher(['bob']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([group('alice', 'fred'), 'bob'])

  matcher(['alice', 'fred', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'fred'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'fred'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['alice', 'eve', 'bob']) ≡ { matched: false }
  matcher(['eve', 'fred', 'bob']) ≡ { matched: false }
  matcher(['alice', 'bob']) ≡ { matched: false }
  matcher(['fred', 'bob']) ≡ { matched: false }
  matcher(['bob']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray()

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice'],
    result: []
  }

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```

  </details>

- #### `matchObject`

  <!-- prettier-ignore -->
  ```ts
  function matchObject<T>(expected?: T): Matcher<T>
  ```

  Matches `expected` enumerable object properties completely or partially with [`rest`](#rest) matcher. Primitives in `expected` are wrapped with their corresponding `Matcher` builder. The rest of properties can be found on the `value` with the rest key. Matches any defined object if `expected` is not provided.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject({ x: 42, y: 'alice' })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    }
  }
  matcher({ y: 'alice', x: 42 }) ≡ {
    matched: true,
    value: { y: 'alice', x: 42 },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' }
    }
  }

  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ { matched: false }
  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', rest })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', rest: {} },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      rest: { matched: true, value: {} }
    }
  }
  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', rest: { z: true, aa: 69 } },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      rest: { matched: true, value: { z: true, aa: 69 } }
    }
  }

  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', customRestKey: rest })

  matcher({ x: 42, y: 'alice', z: true }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', customRestKey: { z: true } },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      customRestKey: { matched: true, value: { z: true } }
    }
  }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject()

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice' },
    result: {}
  }

  matcher(undefined) ≡ { matched: false }
  matcher('alice') ≡ { matched: false }
  ```

  </details>

- #### `group`

    <!-- prettier-ignore -->

  ```ts
  function group<T>(...expected: T[]): Matcher<T[]>
  ```

  An [`IteratorMatcher`](#core-concept) that consumes all a sequence of element matching `expected` array. Similar to regular expression group.
    <details>
    <summary>Example</summary>

    <!-- prettier-ignore -->

  ```js
  const matcher = matchArray([group('alice', 'fred'), 'bob'])

  matcher(['alice', 'fred', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'fred'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'fred'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['alice', 'eve', 'bob']) ≡ { matched: false }
  matcher(['eve', 'fred', 'bob']) ≡ { matched: false }
  matcher(['alice', 'bob']) ≡ { matched: false }
  matcher(['fred', 'bob']) ≡ { matched: false }
  matcher(['bob']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([group(maybe('alice'), 'fred'), 'bob'])

  matcher(['fred', 'bob']) ≡ {
    matched: true,
    value: [[undefined, 'fred'], 'bob'],
    result: [
      {
        matched: true,
        value: [undefined, 'fred'],
        result: [
          { matched: true, value: undefined },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['alice', 'fred', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'fred'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'fred'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([group(some('alice'), 'fred'), 'bob'])

  matcher(['alice', 'fred', 'bob']) ≡ {
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
            result: [
              { matched: true, value: 'alice' }
            ]
          },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['alice', 'alice', 'fred', 'bob']) ≡ {
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
              { matched: true, value: 'alice' }
            ]
          },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['fred', 'bob']) ≡ { matched: false }
  ```

    </details>

- #### `maybe`

  <!-- prettier-ignore -->
  ```ts
  function maybe<T>(expected: T): Matcher<T | undefined>
  ```

  An [`IteratorMatcher`](#core-concept) that consumes an element in the array if it matches `expected`, otherwise does nothing. The unmatched element can be consumed by the next matcher. Similar to the regular expression `?` operator.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([maybe('alice'), 'bob'])

  matcher(['alice', 'bob']) ≡ {
    matched: true,
    value: ['alice', 'bob'],
    result: [
      { matched: true, value: 'alice' },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['bob']) ≡ {
    matched: true,
    value: [undefined, 'bob'],
    result: [
      { matched: true, value: undefined },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['eve', 'bob']) ≡ { matched: false }
  matcher(['eve']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([maybe(group('alice', 'fred')), 'bob'])

  matcher(['alice', 'fred', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'fred'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'fred'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'fred' }
        ]
      },
      { matched: true, value: 'bob' },
    ]
  }
  matcher(['bob']) ≡ {
    matched: true,
    value: [undefined, 'bob'],
    result: [
      { matched: true, value: undefined },
      { matched: true, value: 'bob' }
    ]
  }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([maybe(some('alice')), 'bob'])

  matcher(['alice', 'bob']) ≡ {
    matched: true,
    value: [['alice'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice'],
        result: [
          { matched: true, value: 'alice' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['alice', 'alice', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'alice'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'alice'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'alice' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['bob']) ≡ {
    matched: true,
    value: [undefined, 'bob'],
    result: [
      { matched: true, value: undefined },
      { matched: true, value: 'bob' }
    ]
  }
  ```

  </details>

- #### `not`

  <!-- prettier-ignore -->
  ```ts
  function not<T>(unexpected: T): Matcher<T>
  ```

  Matches if value does not match `unexpected`. Primitives in `unexpected` are wrapped with their corresponding `Matcher` builder
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = not(oneOf('alice', 'bob'))

  matcher('eve') ≡ { matched: true, value: 'eve' }

  matcher('alice') ≡ { matched: false }
  matcher('bob') ≡ { matched: false }
  ```

  </details>

- #### `rest`

  <!-- prettier-ignore -->
  ```ts
  const rest: Matcher<any>
  ```

  An [`IteratorMatcher`](#core-concept) that consumes the remaining elements/properties to prefix matching of arrays and partial matching of objects.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
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
      { headers: [{ value: cookieValue }, restOfHeaders], rest: restOfResponse },
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

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([42, 'alice', rest])

  matcher([42, 'alice']) ≡ {
    matched: true,
    value: [42, 'alice', []],
    result: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' },
      { matched: true, value: [] }
    ]
  }
  matcher([42, 'alice', true, 69]) ≡ {
    matched: true,
    value: [42, 'alice', [true, 69]],
    result: [
      { matched: true, value: 42 },
      { matched: true, value: 'alice' },
      { matched: true, value: [true, 69] }
    ]
  }

  matcher(['alice', 42]) ≡ { matched: false }
  matcher([]) ≡ { matched: false }
  matcher([42]) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', rest })

  matcher({ x: 42, y: 'alice' }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', rest: {} },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      rest: { matched: true, value: {} }
    }
  }
  matcher({ x: 42, y: 'alice', z: true, aa: 69 }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', rest: { z: true, aa: 69 } },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      rest: { matched: true, value: { z: true, aa: 69 } }
    }
  }

  matcher({}) ≡ { matched: false }
  matcher({ x: 42 }) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchObject({ x: 42, y: 'alice', customRestKey: rest })

  matcher({ x: 42, y: 'alice', z: true }) ≡ {
    matched: true,
    value: { x: 42, y: 'alice', customRestKey: { z: true } },
    result: {
      x: { matched: true, value: 42 },
      y: { matched: true, value: 'alice' },
      customRestKey: { matched: true, value: { z: true } }
    }
  }
  ```

  </details>

- #### `some`

  <!-- prettier-ignore -->
  ```ts
  function some<T>(expected: T): Matcher<T[]>
  ```

  An [`IteratorMatcher`](#core-concept) consumes all consecutive elements matching `expected` in the array until it reaches the end or encounters an unmatched element. The next matcher can consume the unmatched element. At least one element must match. Similar to regular expression `+` operator. **`some` does not compose with matchers that consume nothing, such as `maybe`**. Attempting to compose with `maybe` will throw an error as it would otherwise lead to an infinite loop.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([some('alice'), 'bob'])

  matcher(['alice', 'alice', 'bob']) ≡ {
    matched: true,
    value: [['alice', 'alice'], 'bob'],
    result: [
      {
        matched: true,
        value: ['alice', 'alice'],
        result: [
          { matched: true, value: 'alice' },
          { matched: true, value: 'alice' }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }

  matcher(['eve', 'bob']) ≡ { matched: false }
  matcher(['bob']) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = matchArray([some(group('alice', 'fred')), 'bob'])

  matcher(['alice', 'fred', 'bob']) ≡ {
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
              { matched: true, value: 'fred' }
            ]
          }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  matcher(['alice', 'fred', 'alice', 'fred', 'bob']) ≡ {
    matched: true,
    value: [[['alice', 'fred'], ['alice', 'fred']], 'bob'],
    result: [
      {
        matched: true,
        value: [['alice', 'fred'], ['alice', 'fred']],
        result: [
          {
            matched: true,
            value: ['alice', 'fred'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'fred' }
            ]
          },
          {
            matched: true,
            value: ['alice', 'fred'],
            result: [
              { matched: true, value: 'alice' },
              { matched: true, value: 'fred' }
            ]
          }
        ]
      },
      { matched: true, value: 'bob' }
    ]
  }
  ```

  </details>

- #### `allOf`

  <!-- prettier-ignore -->
  ```ts
  function allOf<T>(expected: ...T): Matcher<T>
  ```

  Matches if all `expected` matchers are matched. Primitives in `expected` are wrapped with their corresponding `Matcher` builder. Always matches if `expected` is empty.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const isEven = (x) => x % 2 === 0
  const matchEven = matchPredicate(isEven)

  const matcher = allOf(between(1, 10), matchEven)

  matcher(2) ≡ {
    matched: true,
    value: 2,
    result: [
      { matched: true, value: 2 },
      { matched: true, value: 2 }
    ]
  }

  matcher(0) ≡ { matched: false }
  matcher(1) ≡ { matched: false }
  matcher(12) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = allOf()

  matcher(undefined) ≡ { matched: true, value: undefined, result: [] }
  matcher({ key: 'value' }) ≡ { matched: true, value: { key: 'value' }, result: [] }
  ```

  </details>

- #### `oneOf`

  <!-- prettier-ignore -->
  ```ts
  function oneOf<T>(expected: ...T): Matcher<T>
  ```

  Matches first `expected` matcher that matches. Primitives in `expected` are wrapped with their corresponding `Matcher` builder. Always unmatched when empty `expected`. Similar to [`match`](#match). Similar to the regular expression `|` operator.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = oneOf('alice', 'bob')

  matcher('alice') ≡ { matched: true, value: 'alice' }
  matcher('bob') ≡ { matched: true, value: 'bob' }

  matcher('eve') ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = oneOf()

  matcher(undefined) ≡ { matched: false }
  matcher({ key: 'value' }) ≡ { matched: false }
  ```

  </details>

- #### `when`

  <!-- prettier-ignore -->
  ```ts
  type ValueMapper<T, R> = (value: T, matched: Matched<T>) => R

  function when<T, R>(
    expected?: T,
    ...guards: ValueMapper<T, Boolean>,
    valueMapper: ValueMapper<T, R>
  ): Matcher<R>
  ```

  Matches if `expected` matches and satisfies all the `guards`, then matched value is transformed with `valueMapper`. `guards` are optional. Primative `expected` are wrapped with their corresponding `Matcher` builder. Second parameter to `valueMapper` is the `Matched` `Result`. See [`matchRegExp`](#matchregexp), [`matchArray`](#matcharray), [`matchObject`](#matchobject), [`group`](#group), [`some`](#some) and [`allOf`](#allof) for extra fields on `Matched`.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = when(
    { role: 'teacher', surname: defined },
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong',
    result: {
      role: { matched: true, value: 'teacher' },
      surname: { matched: true, value: 'Wong' }
    }
  }

  matcher({ role: 'student' }) ≡ { matched: false }
  ```

  <!-- prettier-ignore -->
  ```js
  const matcher = when(
    { role: 'teacher', surname: defined },
    ({ surname }) => surname.length === 4, // guard
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong',
    result: {
      role: { matched: true, value: 'teacher' },
      surname: { matched: true, value: 'Wong' }
    }
  }

  matcher({ role: 'teacher', surname: 'Smith' }) ≡ { matched: false }
  ```

  </details>

- #### `otherwise`

  <!-- prettier-ignore -->
  ```ts
  type ValueMapper<T, R> = (value: T, matched: Matched<T>) => R

  function otherwise<T, R>(
    ..guards: ValueMapper<T, Boolean>,
    valueMapper: ValueMapper<T, R>
  ): Matcher<R>
  ```

  Matches if satisfies all the `guards`, then value is transformed with `valueMapper`. `guards` are optional. Second parameter to `valueMapper` is the `Matched` `Result`. See [`matchRegExp`](#matchregexp), [`matchArray`](#matcharray), [`matchObject`](#matchobject), [`group`](#group), [`some`](#some) and [`allOf`](#allof) for extra fields on `Matched`.
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
  ```js
  const matcher = otherwise(
    ({ surname }) => `Good morning ${surname}`
  )

  matcher({ role: 'teacher', surname: 'Wong' }) ≡ {
    matched: true,
    value: 'Good morning Wong'
  }
  ```

  <!-- prettier-ignore -->
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

Consumes `Matcher`s to produce a value.

- #### `match`

  <!-- prettier-ignore -->
  ```ts
  const match<T, R>: (value: T) => (...clauses: Matcher<R>) => R | undefined
  ```

  Returns a matched value for the first clause that matches, or `undefined` if all are unmatched. `match` is to be used as a top-level expression and is not composable. To create a matcher composed of clauses use [`oneOf`](#oneof).
  <details>
  <summary>Example</summary>

  <!-- prettier-ignore -->
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

  <!-- prettier-ignore -->
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

`patcom` does not implement the semantics of TC39 pattern matching proposal. However, `patcom` was inspired by the TC39 pattern matching proposal and, in-fact, has feature parity. As `patcom` is a JavaScript library, it cannot introduce any new syntax, but the syntax remains relatively similar.

### Comparision of TC39 pattern matching proposal on the left to `patcom` on the right

![tc39 comparision](https://cdn.jsdelivr.net/gh/concept-not-found/patcom/tc39-proposal-pattern-matching/diff.png)

### Differences

The most notable difference is `patcom` implemented [enumerable object properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) matching, whereas TC39 pattern matching proposal implements partial object matching. See [tc39/proposal-pattern-matching#243](https://github.com/tc39/proposal-pattern-matching/issues/243). The [`rest`](#rest) matcher can be used to achieve partial object matching.

`patcom` also handles holes in arrays differently. Holes in arrays in TC39 pattern matching proposal will match anything, whereas `patcom` uses the more literal meaning of `undefined` as one would expect with holes in arrays defined in standard JavaScript. The [`any`](#any) matcher must be explicitly used if one desires to match anything for a specific array position.

Since `patcom` had to separate the pattern matching from destructuring, enumerable object properties matching is the most sensible. Syntactically separation of the pattern from destructuring is the most significant difference.

#### TC39 pattern matching proposal `when` syntax shape

<!-- prettier-ignore -->
```js
when (
  pattern + destructuring
) if guard:
  expression
```

#### `patcom` `when` syntax shape

<!-- prettier-ignore -->
```js
when (
  pattern,
  (destructuring) => guard,
  (destructuring) => expression
)
```

`patcom` offers [`allOf`](#allof) and [`oneOf`](#oneof) matchers as subsitute for the [pattern combinators](https://github.com/tc39/proposal-pattern-matching#pattern-combinators) syntax.

#### TC39 pattern matching proposal `and` combinator + `or` combinator

Note that the usage of `and` in this example is purely to capture the match and assign it to `dir`.

<!-- prettier-ignore -->
```js
when (
  ['go', dir and ('north' or 'east' or 'south' or 'west')]
):
  ...use dir
```

#### `patcom` `oneOf` matcher + destructuring

Assignment to `dir` separated from the pattern.

<!-- prettier-ignore -->
```js
when (
  ['go', oneOf('north', 'east', 'south', 'west')],
  ([, dir]) =>
    ...use dir
)
```

Additional consequence of the separating the pattern from destructuring is `patcom` has no need for any of:

- [interpolation pattern](https://github.com/tc39/proposal-pattern-matching#interpolation-pattern) syntax
- [custom matcher protocol interpolations](https://github.com/tc39/proposal-pattern-matching#custom-matcher-protocol-interpolations) syntax
- [`with` chaining](https://github.com/tc39/proposal-pattern-matching#with-chaining) syntax.

Another difference is TC39 pattern matching proposal caches iterators and object property accesses. This has been implemented in `patcom` as a different variation of `match`, which is powered by `cachingOneOf`.

To see a complete comparison with TC39 pattern matching proposal and unit tests to prove full feature parity, see [tc39-proposal-pattern-matching folder](https://github.com/concept-not-found/patcom/tree/master/tc39-proposal-pattern-matching).

## What about [`match-iz`](https://github.com/shuckster/match-iz)?

`match-iz` is similarly inspired by TC39 pattern matching proposal has many similarities to `patcom`. However, `match-iz` is not feature complete to TC39 pattern matching proposal, most notably missing is:

- when guards
- caching iterators and object property accesses

`match-iz` also offers a different match result API, where `matched` and `value` are allowed to be functions. The same functionality in `patcom` can be found in the form of [functional mappers](https://github.com/concept-not-found/patcom/blob/master/mappers.js).

## Contributions welcome

The following is a non-exhaustive list of features that could be implemented in the future:

- more unit testing
- better documentation
  - executable examples
- tests that extract and execute samples out of documentation
- richer set of matchers
  - as this library exports modules, the size of the npm package does not matter if consumed by a tree shaking bundler. This means matchers of any size will be accepted as long as all matchers can be organized well as a cohesive set
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

[`patcom` is seeking funding](https://ko-fi.com/pyrolistical)

## What does `patcom` mean?

`patcom` is short for pattern combinator, as `patcom` is the same concept as [parser combinator](https://en.wikipedia.org/wiki/Parser_combinator)
