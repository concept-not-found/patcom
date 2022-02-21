import { defined, when, otherwise } from '../index.js'

import { match } from './index.js'

export default (initialState = {}) =>
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
