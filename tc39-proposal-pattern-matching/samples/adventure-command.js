import { oneOf, allOf, matchProp } from '../../index.js'
import { match, when, otherwise } from '../index.js'

export default (handleGoDir, handleTakeItem, handleOtherwise) => (command) =>
  match(command)(
    when(['go', oneOf('north', 'east', 'south', 'west')], ([, dir]) =>
      handleGoDir(dir)
    ),
    when(['take', allOf(/[a-z]+ ball/, matchProp('weight'))], ([, item]) =>
      handleTakeItem(item)
    ),
    otherwise(() => handleOtherwise())
  )
