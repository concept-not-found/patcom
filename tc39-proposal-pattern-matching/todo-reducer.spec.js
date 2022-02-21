import { TodoReducer } from './sample.js'

describe('tc39-proposal-pattern-matching', () => {
  describe('todo-reducer sample', () => {
    test('add visFilter on set-visibility-filter action', () => {
      const reducer = TodoReducer()
      const state = reducer(
        {
          existing: 'state',
        },
        {
          type: 'set-visibility-filter',
          payload: 'some visibility filter',
        }
      )
      expect(state).toEqual({
        existing: 'state',
        visFilter: 'some visibility filter',
      })
    })

    test('add todos on add-todo action', () => {
      const reducer = TodoReducer()
      const state = reducer(
        {
          existing: 'state',
          todos: [
            {
              text: 'existing todo',
              completed: true,
            },
          ],
        },
        {
          type: 'add-todo',
          payload: 'new todo',
        }
      )
      expect(state).toEqual({
        existing: 'state',
        todos: [
          {
            text: 'existing todo',
            completed: true,
          },
          {
            text: 'new todo',
            completed: false,
          },
        ],
      })
    })

    test('set a completed todo to be incomplete on toggle-todo action', () => {
      const reducer = TodoReducer()
      const state = reducer(
        {
          existing: 'state',
          todos: [
            {
              text: 'existing todo',
              completed: true,
            },
          ],
        },
        {
          type: 'toggle-todo',
          payload: 0,
        }
      )
      expect(state).toEqual({
        existing: 'state',
        todos: [
          {
            text: 'existing todo',
            completed: false,
          },
        ],
      })
    })
  })

  test('set an incomplete todo to be completed on toggle-todo action', () => {
    const reducer = TodoReducer()
    const state = reducer(
      {
        existing: 'state',
        todos: [
          {
            text: 'existing todo',
            completed: false,
          },
        ],
      },
      {
        type: 'toggle-todo',
        payload: 0,
      }
    )
    expect(state).toEqual({
      existing: 'state',
      todos: [
        {
          text: 'existing todo',
          completed: true,
        },
      ],
    })
  })

  test('pass-through state on unknown action', () => {
    const reducer = TodoReducer()
    const state = reducer(
      {
        existing: 'state',
      },
      {
        type: 'add-secret-todo',
        payload: 'shhh',
      }
    )
    expect(state).toEqual({
      existing: 'state',
    })
  })
})
