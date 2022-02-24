# patcom

`patcom` is pattern matching in plain JavaScript. Easily build pattern matchers from simpler smaller matchers.

Pattern matching is a declarative programming. The code matches the shape of the data.

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

Using `patcom` we can match a `person` against by their `role` to form a `greeting`.
```js
import {match, when, otherwise, defined} from 'patcom'

...

const greeting = match (person) (
  when ({ role: 'student' }, () =>
    'Hello fellow student.'
  ),
  when ({ role: 'teacher', surname: defined }, ({ surname }) =>
    `Good morning ${surname} sensei.`
  ),
  otherwise (() =>
    'STRANGER DANGER'
  )
)
```

<details>
<summary>What is <code>match</code> doing?</summary>

`match` finds the first `when` clause that matches, then the matched object is transformed into the greeting. If none of the `when` clauses match, the `otherwise` clause always matches.

If `person` is `{role: 'student'}`, then `greeting` is `Hello fellow student`.

If `person` is `{role: 'teacher', surname: 'Wong'}`, then `greeting` is `Good morning Wong sensei.`

If `person` is anything else, then `greeting` is `STRANGER DANGER`
</details>

## More expressive than `switch`

Pattern match over whole objects and not just single fields.

### Imperative `switch` & `if` 😔
```
switch (person.role) {
  case 'student':
    if (person.grade >= 90) {
      return 'Gold star'
    } else if (person.grade >= 60) {
      return 'Keep trying'
    } else {
      return 'See me after class'
    }
  default:
      throw new Exception(`expected student, but got ${person}`)
}
```

### Declarative `match` 🙂
```js
return match (person) (
  when ({ role: 'student', grade: greaterThanEquals(90) }, () =>
    'Gold star'
  ),
  when ({ role: 'student', grade: greaterThanEquals(60) }, () =>
    'Keep trying'
  ),
  when ({ role: 'student', grade: defined }, () =>
    'See me after class'
  ),
  otherwise ((person) =>
    throw new Exception(`expected student, but got ${person}`)
  )
)
```
<details>
<summary>What is <code>greaterThanEquals</code>?</summary>

`greaterThanEquals` is a `matcher` provided by `patcom`. `greaterThanEquals(90)` means "match a number greater or equal to 90".
</details>

## Match `Array`, `String`, `RegExp` and more
### Arrays
```js
match (list) (
  when ([], () =>
    'empty list'
  ),
  when ([defined], ([head]) =>
    `single item ${head}`
  ),
  when ([defined, rest], ([head, ...tail]) =>
    `multiple items`
  )
)
```
<details>
<summary>What is <code>rest</code>?</summary>

`rest` is a special `matcher` used within array and object patterns. Array and objects are complete matches and the `rest` pattern consumes all remaining values.
</details>

### String & RegExp
```js
match (command) (
  when ('sit', () =>
    sit()
  ),
  // matchedRegExp is the RegExp match result
  when (/^move (\d) spaces$/, (value, { matchedRegExp: [, distance] }) =>
    move(distance)
  ),
  // ...which means matchedRegExp has the named groups
  when (/^eat (?<food>\w+)$/, (value, { matchedRegExp: { groups: { food } } }) =>
    eat(food)
  )
)
```

### Number, BigInt & Boolean
```js
match (value) (
  when (69, () =>
    'nice'
  ),
  when (69n, () =>
    'big nice'
  ),
  when (true, () =>
    'not nice'
  )
)
```

## Match complex data structures
```js
match (complex) (
  when ({ schedule: [{ class: 'history', rest }, rest] }, () =>
    'history first thing on schedule? buy coffee'
  ),
  when ({ schedule: [{ professor: oneOf('Ko', 'Smith'), rest }, rest] }, ({ schedule: [{ professor }] }) =>
    `Professor ${professor} teaching? bring voice recorder`
  )
)
```

### Matchers are extractable
From the previous example, complex patterns can be broken down to simpler matchers.
```js
const fastSpeakers = oneOf('Ko', 'Smith')

match (complex) (
  when ({ schedule: [{ class: 'history', rest }, rest] }, () =>
    'history first thing on schedule? buy coffee'
  ),
  when ({ schedule: [{ professor: fastSpeakers, rest }, rest] }, ({ schedule: [{ professor }] }) =>
    `Professor ${professor} teaching? bring voice recorder`
  )
)
```

## Custom matchers
Define custom matchers with any logic. Matchers are simply functions that take in a `value` and returns a match result. Either the `value` is matched or is unmatched.

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
    when (matchDuck, () =>
      'quack'
    ),
    when (matchDragon, () =>
      'rawr'
    )
  )
)
```

All the examples thus far have been using `match`, but `match` itself isn't a matcher. If we use `speak` in another pattern, we can use `oneOf` instead.

```js
const speakMatcher = oneOf (
  when (matchDuck, () =>
    'quack'
  ),
  when (matchDragon, () =>
    'rawr'
  )
)
```

Now upon unrecognized animals, whereas `speak` previously returned `undefined`, `speakMatcher` now returns `{ matched: false }`. This allows us to combine `speakMatcher` with other patterns.

```js
match (animal) (
  when (speakMatcher, (sound) =>
    `the ${animal.type} goes ${sound}`
  ),
  otherwise(() =>
    `the ${animal.type} remains silent`
  )
)
```

Everything except for `match` is actually a matcher, including `when` and `otherwise`. Primative value and data types are automatically converted to a corresponding matcher.

```js
when ({ role: 'student' }, ...) === when (matchObject({ role: 'student' }), ...)
when ([defined], ...) === when (matchArray([defined]), ...)
when ('sit', ...) === when (matchString('sit'), ...)
when (/^move (\d) spaces$/, ...) === when (matchRegExp(/^move (\d) spaces$/), ...)
when (69, ...) === when (matchNumber(69), ...)
when (69n, ...) === when (matchBigInt(69n), ...)
when (true, ...) === when (matchBoolean(true), ...)
```

Even the complex patterns are composed of simpler matchers.
### Primatives
```js
when (
  {
    schedule: [
      {
        class: 'history',
        rest
      },
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
      matchObject({
        class: matchString('history'),
        rest
      }),
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
Directly useable Matchers.
- #### `any`
  ```ts
  declare const any: Matcher<any>
  ```
  Matches for any value, including `undefined`.

- #### `defined`
  ```ts
  declare const defined: Matcher<any>
  ```
  Matches for any defined value, or in other words not `undefined`.

- #### `empty`
  ```ts
  declare const empty: Matcher<[] | {} | ''>
  ```
  Matches either `[]`, `{}`, or `''` (empty string).

### `Matcher` builders
Builders to create a `Matcher`.
- #### `between`
  ```ts
  declare function between(lower: number, upper: number): Matcher<number>
  ```
  Matches if value is a Number, where lower <= value < upper

- #### `equals`
  ```ts
  declare function equals<T>(expected: T): Matcher<T>
  ```
  Matches `expected` if strictly equals `===` to value.

- #### `greaterThan`
  ```ts
  declare function greaterThan(expected: number): Matcher<number>
  ```
  Matches if value is a Number, where expected < value

- #### `greaterThanEquals`
  ```ts
  declare function greaterThanEquals(expected: number): Matcher<number>
  ```
  Matches if value is a Number, where expected <= value

- #### `lessThan`
  ```ts
  declare function lessThan(expected: number): Matcher<number>
  ```
  Matches if value is a Number, where expected > value

- #### `lessThanEquals`
  ```ts
  declare function lessThanEquals(expected: number): Matcher<number>
  ```
  Matches if value is a Number, where expected >= value

- #### `matchNonEmptyString`
  ```ts
  declare const nonEmptyString: Matcher<string>
  ```
  Matches if value is a String that is not empty, or in other words `value !== ''`.

- #### `matchPredicate`
  ```ts
  declare function matchPredicate<T>(predicate: () => Boolean): Matcher<T>
  ```
  Matches value that satisfies the predicate, or in other words `predicate(value) === true`

- #### `matchBigInt`
  ```ts
  declare function matchBigInt(expected?: bigint): Matcher<bigint>
  ```
  Matches if value is the `expected` BigInt. Matches any defined BigInt if `expected` is not provided.

- #### `matchNumber`
  ```ts
  declare function matchNumber(expected?: number): Matcher<number>
  ```
  Matches if value is the `expected` Number. Matches any defined Number if `expected` is not provided.

- #### `matchProp`
  ```ts
  declare function matchProp(expected: string): Matcher<string>
  ```
  Matches if value has `expected` as a property key, or in other words `expected in value`.

- #### `matchString`
  ```ts
  declare function matchString(expected?: string): Matcher<string>
  ```
  Matches if value is the `expected` String. Matches any defined String if `expected` is not provided.

- #### `matchRegExp`
  ```ts
  declare function matchRegExp(expected: RegExp): Matcher<string>
  ```
  Matches if value is the `expected` String. Matches any defined String if `expected` is not provided.


### `Matcher` composers
Creates a `Matcher` from other `Matcher`s.
- #### `matchArray`
  ```ts
  declare function matchArray<T>(expected: T[]): Matcher<Array<T>>
  ```
  Matches `expected` array of matchers completely. Values must be an array with the same number of elements as `expected` array. Each element in value array must match to the coresponding matcher in expected array. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Value is allowed to have more elements than `expected` array if special `rest` matcher is used to consume remainder of elements.

- #### `matchObject`
  ```ts
  declare function matchObject<T>(expected: T): Matcher<T>
  ```
  Matches `expected` object of matchers completely. Values must be an object with the same set of keys as `expected` object. Each value in object must match to the coresponding matcher in expected object. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Value is allowed to have more keys than `expected` object if special `rest` matcher is used to consume reaminder of keys. Rest of properties grouped into the `rest` property on the matched result.

- #### `rest`
  ```ts
  declare const res: Matcher<any>
  ```
  A special `Matcher` that is only valid as element of `matchArray` or property of `matchObject`. This consumes the remaining elements/properties to allow a complete match of the array/object.

- #### `allOf`
  ```ts
  declare function allOf<T>(expected: ...T): Matcher<T[]>
  ```
  Matches if all `expected` matchers are matched. Primatives in `expected` are wrapped with their corresponding `Matcher` builder.

- #### `oneOf`
  ```ts
  declare function oneOf<T>(expected: ...T): Matcher<T>
  ```
  Matches first `expected` matcher that matches. Primatives in `expected` are wrapped with their corresponding `Matcher` builder. Similar to `match`

- #### `when`
  ```ts
  declare function when<T, R>(expected: T, ...guards: (value: T) => Boolean, valueMapper?: (value: T) => R): Matcher<R>
  ```
  Matches if `expected` matches and satifies all the `guards`, then matched value is transformed with `valueMapper`. `guards` and `valueMapper` are optional. Primative `expected` are wrapped with their corresponding `Matcher` builder.

- #### `otherwise`
  ```ts
  declare function otherwise<T, R>(...guards: (value: T) => Boolean, valueMapper?: (value: T) => R): Matcher<R>
  ```
  Matches if satifies all the `guards`, then value is transformed with `valueMapper`. `guards` and `valueMapper` are optional. Primative `expected` are wrapped with their corresponding `Matcher` builder.

### `Matcher` consumers
- #### `match`
  ```ts
  declare function match<T>(...clauses: Matcher<T>): T | undefined
  ```
  Returns a matched value for the first clause that matches, or `undefined` if all are unmatched. Similar to `oneOf`.
