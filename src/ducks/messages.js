/* global SpeechSynthesisUtterance, speechSynthesis */
import { createSlice } from 'redux-starter-kit'
import { SHOW_TOAST } from './toasts'
import removeMd from 'remove-markdown'
import createSocketChannel from '../util/createSocketChannel'
import { call, put, race, takeLatest, takeEvery, take, delay, cancelled, fork, select } from 'redux-saga/effects'
import { socketAPI } from '../api'

const { actions, reducer } = createSlice({
  initialState: {
    loading: false,
    invalidated: true,
    lastUpdated: null,
    serverStatus: 'unknown',
    channelStatus: 'off',
    rated: [],
    items: []
  },
  reducers: {
    MESSAGE_SEND (state, { payload }) {
      state.items.push({
        type: 'message_received',
        user: socketAPI.guid,
        text: payload,
        timestamp: Date.now(),
        from: 'user',
        channel: 'socket'
      })
    },
    MESSAGE_CHANNEL_START (state, { payload }) { },
    MESSAGE_CHANNEL_STOP (state, { payload }) { },
    MESSAGE_CHANNEL_ONLINE (state, { payload }) {
      state.channelStatus = 'on'
    },
    MESSAGE_CHANNEL_OFFLINE (state, { payload }) {
      state.channelStatus = 'off'
      state.serverStatus = 'unknown'
    },
    MESSAGE_SERVER_ONLINE (state, { payload }) {
      state.serverStatus = 'on'
    },
    MESSAGE_SERVER_OFFLINE (state, { payload }) {
      state.serverStatus = 'off'
    },
    MESSAGE_LIVE_DATA_RECEIVED (state, { payload }) {
      payload.from = payload.from || 'Basebot'
      payload.timestamp = Date.now()
      state.items.push(payload)
      state.lastUpdated = new Date().toString()
    },
    RATE_MESSAGE (state, { payload }) {
      state.rated.push(payload.timestamp)
    },
    ENABLE_SPEECH (state, { payload }) {
      state.speechEnabled = true
    },
    DISABLE_SPEECH (state, { payload }) {
      state.speechEnabled = false
    }
  }
})

function * onRate ({ payload }) {
  yield call(socketAPI.send, JSON.stringify({
    type: 'rating_received',
    user: socketAPI.guid,
    value: payload.value,
    intent: payload.intent
  }))
}

function * onSend ({ payload }) {
  yield call(socketAPI.send, JSON.stringify({
    type: 'message_received',
    user: socketAPI.guid,
    text: payload,
    device: isMobile() ? 'Mobile' : 'Desktop',
    channel: 'socket'
  }))
}

function * onDisconnect () {
  const disconnectChannel = yield call(createSocketChannel, socketAPI, 'close')
  try {
    yield takeLatest(disconnectChannel, function * () {
      yield put(actions.MESSAGE_SERVER_OFFLINE())
      if (!socketAPI.reconnecting) {
        yield call(socketAPI.reconnect)
        yield put(SHOW_TOAST({ status: 'warning', title: 'Reconnecting' }))
      }
    })
  } catch (err) { }
}

function * onReconnect () {
  const reconnectChannel = yield call(createSocketChannel, socketAPI, 'reconnect')
  try {
    yield takeLatest(reconnectChannel, function * () {
      yield call(socketAPI.send, JSON.stringify({
        type: 'welcome_back',
        user: socketAPI.guid,
        channel: 'socket'
      }))
      yield put(actions.MESSAGE_SERVER_ONLINE())
    })
  } catch (err) { }
}

function * onLiveData (payload) {
  if (payload && JSON.parse(payload).type === 'message') {
    const speechEnabled = yield select(state => state.messages.speechEnabled)
    if (speechEnabled) {
      yield call(say, payload)
    }
    yield put(actions.MESSAGE_LIVE_DATA_RECEIVED(JSON.parse(payload)))
  }
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
    const messageChannel = yield call(createSocketChannel, socketAPI, 'message')

    // listen for connection events
    yield fork(onDisconnect)
    yield fork(onReconnect)

    yield call(socketAPI.send, JSON.stringify({
      type: 'hello',
      user: socketAPI.guid,
      channel: 'socket'
    }))
    yield takeEvery(messageChannel, onLiveData)
  } catch (err) { } finally {
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
  yield takeEvery('RATE_MESSAGE', onRate)
}

export const { MESSAGE_CHANNEL_START, MESSAGE_SEND, RATE_MESSAGE, ENABLE_SPEECH, DISABLE_SPEECH } = actions

export default reducer

async function say (payload) {
  var text = removeMd(JSON.parse(payload).text)
    .replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g, 'Check out the link in the message for more info.')
  if (SpeechSynthesisUtterance && speechSynthesis && speechSynthesis.speak) {
    let i = 0
    const textChunks = text.match(/.{250}\w*\W*|.*/g)
    const utterances = textChunks.map(chunk => new SpeechSynthesisUtterance(chunk))
    const onend = () => {
      i++
      if (utterances[i]) {
        utterances[i].onend = onend
        speechSynthesis.speak(utterances[i])
      }
    }
    utterances[0].onend = onend
    speechSynthesis.speak(utterances[0])
  }
}

function isMobile () {
  var check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true })(navigator.userAgent || navigator.vendor || window.opera)
  return check
}
