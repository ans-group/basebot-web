import { createSlice } from 'redux-starter-kit'
import { SHOW_TOAST } from './toasts'
import createSocketChannel from '../util/createSocketChannel'
import { call, put, race, takeLatest, takeEvery, take, delay, cancelled, fork } from 'redux-saga/effects'
import { socketAPI, restAPI } from '../api'

window.api = socketAPI

const { actions, reducer } = createSlice({
  initialState: {
    loading: false,
    invalidated: true,
    lastUpdated: null,
    serverStatus: 'unknown',
    channelStatus: 'off',
    items: []
  },
  reducers: {
    MESSAGE_SEND(state, { payload }) {
      state.items.push({
        type: 'message_received',
        user: socketAPI.guid,
        text: payload,
        timestamp: Date.now(),
        from: 'user',
        channel: 'socket'
      })
    },
    MESSAGE_CHANNEL_START(state, { payload }) {},
    MESSAGE_CHANNEL_STOP(state, { payload }) {},
    MESSAGE_CHANNEL_ONLINE(state, { payload }) {
      state.channelStatus = 'on'
    },
    MESSAGE_CHANNEL_OFFLINE(state, { payload }) {
      state.channelStatus = 'off'
      state.serverStatus = 'unknown'
    },
    MESSAGE_SERVER_ONLINE(state, { payload }) {
      state.serverStatus = 'on'
    },
    MESSAGE_SERVER_OFFLINE(state, { payload }) {
      state.serverStatus = 'off'
    },
    MESSAGE_LIVE_DATA_RECEIVED(state, { payload }) {
      const item = JSON.parse(payload)
      if (item.type === 'message') {
        item.from = item.from || 'Basebot'
        item.timestamp = Date.now()
        state.items.push(item)
        state.lastUpdated = new Date().toString()
      }
    }
  }
})

function * onSend ({payload}) {
  yield call(socketAPI.send, {
    type: 'message_received',
    user: socketAPI.guid,
    text: payload,
    channel: 'socket'
  })
}

function * onDisconnect () {
  yield call(socketAPI.onAsync, 'close')
  yield put(actions.MESSAGE_SERVER_OFFLINE())
  yield put(SHOW_TOAST({status: 'error', title: 'Connection lost'}))
  yield call(socketAPI.reconnect)
}

function * onReconnect () {
  yield call(socketAPI.onAsync, 'reconnect')
  yield call(socketAPI.send, {
    type: 'welcome_back',
    user: socketAPI.guid,
    channel: 'socket'
  })
  yield put(SHOW_TOAST({status: 'success', title: 'Reconnected'}))
  yield put(actions.MESSAGE_SERVER_ONLINE())
}

function * onLiveData (payload) {
  yield put(actions.MESSAGE_LIVE_DATA_RECEIVED(payload))
}

function * connectChannel () {
  try {
    // enable the channel and connect
    yield put(actions.MESSAGE_CHANNEL_ONLINE())
    yield call(socketAPI.connect)
    const { timeout } = yield race({
      connected: call(socketAPI.onAsync, 'open'),
      timeout: delay(5000)
    })
    if (timeout) {
      // connect failed
      yield put(actions.MESSAGE_SERVER_OFFLINE())
    } else {
      yield put(actions.MESSAGE_SERVER_ONLINE())
    }

    // process data events
    const socketChannel = yield call(createSocketChannel, socketAPI, 'message')

    // listen for connection events
    yield fork(onDisconnect)
    yield fork(onReconnect)
    yield call(socketAPI.send, {
      type: 'hello',
      user: socketAPI.guid,
      channel: 'socket'
    })

    yield takeEvery(socketChannel, onLiveData)
  } catch (err) {} finally {
    if (yield cancelled()) {
      yield put(actions.MESSAGE_CHANNEL_OFFLINE())
    }
  }
}

function * startChannel () {
  yield race({
    task: call(connectChannel),
    cancel: take('MESSAGE_CHANNEL_STOP')
  })
}

export function * saga () {
  yield takeLatest('MESSAGE_CHANNEL_START', startChannel)
  yield takeLatest('MESSAGE_SEND', onSend)
}

export const { MESSAGE_CHANNEL_START, MESSAGE_SEND } = actions

export default reducer
