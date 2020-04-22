/* global Audio */
import { createSlice } from 'redux-starter-kit'
import { call, put, takeLatest, select } from 'redux-saga/effects'
import { MESSAGE_SEND, ENABLE_SPEECH } from './messages'
import completeAudioURI from '../assets/Complete'
import { recognitionSupport, startRecognition, stopRecognition, detectVoice } from '../util/recognitionChrome'
import startAudioURI from '../assets/Plink'

const startAudio = new Audio(startAudioURI)
const completeAudio = new Audio(completeAudioURI)
startAudio.volume = 0.5
completeAudio.volume = 0.5

const { actions, reducer } = createSlice({
  initialState: {
    recording: false
  },
  reducers: {
    START_RECORDING (state, { payload }) {
      state.recording = true
    },
    STOP_RECORDING (state, { payload }) { },
    RECORDING_ENDED (state, { payload }) {
      state.recording = false
    },
    TOGGLE_RECORDING (state, { payload }) { },
    RECORDING_FAILED (state, { payload }) {
      state.recording = false
    }
  }
})

function * onStartRecording ({ payload }) {
  yield call(startAudio.play.bind(startAudio))
  try {
    let transcribedAudio
    if (recognitionSupport) {
      yield call(startRecognition)
      transcribedAudio = yield call(detectVoice)
      console.log('using in-built recognition')
    }
    yield put(actions.STOP_RECORDING())
    if (transcribedAudio) {
      yield put(MESSAGE_SEND(transcribedAudio))
      yield put(ENABLE_SPEECH())
    }
  } catch (err) {
    console.error(err)
    yield put(actions.STOP_RECORDING())
    yield put(actions.RECORDING_FAILED())
  }
}

function * onStopRecording ({ payload }) {
  const recording = yield select(state => state.audio.recording)
  if (recording) {
    yield call(completeAudio.play.bind(completeAudio))
    try {
      if (recognitionSupport) {
        yield call(stopRecognition)
      }
    } catch (err) {
      console.error(err)
      yield put(actions.RECORDING_FAILED())
    }
    yield put(actions.RECORDING_ENDED())
  }
}

function * onToggleRecording ({ payload }) {
  const recording = yield select(state => state.audio.recording)
  yield put(recording ? actions.STOP_RECORDING(payload) : actions.START_RECORDING(payload))
}

export function * saga () {
  yield takeLatest('START_RECORDING', onStartRecording)
  yield takeLatest('STOP_RECORDING', onStopRecording)
  yield takeLatest('TOGGLE_RECORDING', onToggleRecording)
}

export const { START_RECORDING, TOGGLE_RECORDING } = actions

export default reducer
