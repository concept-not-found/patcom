# TC39 proposal pattern matching

This folder contains TC39 proposal pattern matching [samples](./sample.js) but rewritten in `patcom`. Unit tests in this folder exercise the samples in more detail.

Included with `patcom` is a variation of [`match`](./index.js) which implements caching iterators and object property accesses.

```js
import {match} from 'patcom/tc39-proposal-pattern-matching'
```
