import { expectType, TypeEqual } from 'ts-expect'

expectType<Matcher<boolean>>(matchIdentical(false))
expectType<Matcher<number>>(matchIdentical(42))
expectType<Matcher<string>>(matchIdentical('hello'))
expectType<Matcher<{ x: string }>>(matchIdentical({ x: 'hello' }))
expectType<Matcher<string>>(fromMatchable('hello'))
expectType<TypeEqual<string, Matchable<string>>>(true)
expectType<TypeEqual<string, Matchable<Matcher<string>>>>(true)
expectType<TypeEqual<[string], Matchable<[string]>>>(true)
expectType<TypeEqual<[string], Matchable<[Matcher<string>]>>>(true)
expectType<TypeEqual<[[string]], Matchable<[Matcher<[string]>]>>>(true)
expectType<TypeEqual<[[string]], Matchable<[[Matcher<string>]]>>>(true)
expectType<TypeEqual<{ x: string }, Matchable<{ x: string }>>>(true)
expectType<TypeEqual<{ x: string }, Matchable<Matcher<{ x: string }>>>>(true)
expectType<TypeEqual<{ x: string }, Matchable<{ x: Matcher<string> }>>>(true)
expectType<TypeEqual<{ x: { y: string } }, Matchable<{ x: { y: string } }>>>(
  true
)
expectType<
  TypeEqual<{ x: { y: string } }, Matchable<{ x: Matcher<{ y: string }> }>>
>(true)
expectType<
  TypeEqual<{ x: { y: string } }, Matchable<{ x: { y: Matcher<string> } }>>
>(true)
expectType<Matcher<{ x: string }>>(matchObject({ x: 'hello' }))
expectType<Matcher<{ x: string }>>(matchObject({ x: matchIdentical('hello') }))
