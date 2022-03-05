# 1.0.0

### Breaking changes

- unified value matcher as an iterator matcher
- aligned expected into `matchArray` with values. this means `rest`, `some`, `group` are all arrays in the value. `maybe` will be present as `undefined` on matched array value
- grouped `rest` values on matchObject
- changed `asMatcher` match `undefined` instead of matching `any` when given an `undefined`
- passing in `undefined` into equals now requires a match to `undefined`, where as previously it acted as `any`
- normalized all results fields to be singular result
- fixed bug where `asMatcher` was returning wrong matcher for boolean, number and string
- fixed bug for `matchString` where did not handle `new String`s correctly for either the expected nor the value
- fixed bug where a string passed into `matchArray` was not unmatched

### Features

- rewrote `cachedGenerator` to be `TimeJumpIterator` with a `now` and `jump` API. `TimeJumpIterator` is now part of the published API
- added new matchers, `maybe`, `some`, `group`
- relicense to MIT

# 0.1.3

initial release
