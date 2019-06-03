import { createSlice } from 'redux-starter-kit'

const { actions, reducer } = createSlice({
  initialState: {
    byId: {}
  },
  reducers: {
    SHOW_TOAST(state, { payload }) {
      const id = Date.now()
      state.byId[id] = { ...payload, id }
    },
    REMOVE_TOAST(state, { payload }) {
      delete state.byId[payload.id]
    }
  }
})

export const { SHOW_TOAST, REMOVE_TOAST } = actions

export default reducer
