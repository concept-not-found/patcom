import { any } from '../../index.js'

import { match, when, otherwise } from '../index.js'

export default (initialState = {}) =>
  function todosReducer(state = initialState, action) {
    return match(action)(
      when(
        { type: 'set-visibility-filter', payload: any },
        ({ payload: visFilter }) => ({ ...state, visFilter })
      ),
      when({ type: 'add-todo', payload: any }, ({ payload: text }) => ({
        ...state,
        todos: [...state.todos, { text, completed: false }],
      })),
      when({ type: 'toggle-todo', payload: any }, ({ payload: index }) => {
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
