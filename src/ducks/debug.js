import { createSlice } from 'redux-starter-kit'
import { call, takeLatest } from 'redux-saga/effects'
import { socketAPI } from '../api'

const { actions, reducer } = createSlice({
  initialState: {
    logging: true,
    endpoint: localStorage.getItem('lastBasebotEndpoint') ? localStorage.getItem('lastBasebotEndpoint').replace(/(wss:\/\/|ws:\/\/)/, '') : 'localhost:3001'
  },
  reducers: {
    UPDATE_ENDPOINT(state, { payload }) {
      console.log(payload)
      state.endpoint = payload
    },
    UPDATE_LOGGING(state, { payload }) {
      state.logging = payload
    }
  }
})

function* onUpdateEndpoint({ payload }) {
  yield call(socketAPI.reconnect, `ws://${payload}`)
}


export function* saga() {
  yield takeLatest('UPDATE_ENDPOINT', onUpdateEndpoint)
}

export const { UPDATE_ENDPOINT, UPDATE_LOGGING } = actions

export default reducer
