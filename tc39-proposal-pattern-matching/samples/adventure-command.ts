import { oneOf, allOf, matchProp } from '../..'
import { match, when, otherwise } from '..'

type Direction = 'north' | 'east' | 'south' | 'west'
export type Item = string & { weight: any }

export default (
    handleGoDir: (dir: Direction) => void,
    handleTakeItem: (item: Item) => void,
    handleOtherwise: () => void
  ) =>
  (command: string[]) =>
    match(command)(
      when(['go', oneOf('north', 'east', 'south', 'west')], ([, dir]) =>
        handleGoDir(dir as Direction)
      ),
      when(['take', allOf(/[a-z]+ ball/, matchProp('weight'))], ([, item]) =>
        handleTakeItem(item as Item)
      ),
      otherwise(() => handleOtherwise())
    )
