// import './ga'
import React from 'react'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { configureStore, getDefaultMiddleware } from 'redux-starter-kit'
import logger from 'redux-logger'

import Base from './components/Base'
import Messages from './containers/Messages'
import Debug from './containers/Debug'
import MessageInput from './containers/MessageInput'
import Header from './components/Header'
import messagesReducer, { saga as messagesSaga } from './ducks/messages'
import debugReducer, { saga as debugSaga } from './ducks/debug'
import audioReducer, { saga as audioSaga } from './ducks/audio'
import toastsReducer from './ducks/toasts'

// Redux/Saga
const sagaMiddleware = createSagaMiddleware()

function * rootSaga () {
  yield all([
    messagesSaga(),
    audioSaga(),
    debugSaga()
  ])
}

const gdm = getDefaultMiddleware()
const defaultMiddleware = Array.isArray(gdm)
  ? gdm
  : (
    gdm
      ? [gdm]
      : []
  )

const middleware = [
  ...defaultMiddleware,
  sagaMiddleware
]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(logger)
}
const store = configureStore({
  reducer: {
    toasts: toastsReducer,
    messages: messagesReducer,
    audio: audioReducer,
    debug: debugReducer
  },
  middleware
})

sagaMiddleware.run(rootSaga)

// End Redux/Saga

const mapDispatchToProps = dispatch => {
  return {
    restoreSession: ({ id, token }) => dispatch(LOGIN_RESTORED({ id, token }))
  }
}

class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <div style={{
          display: window.innerWidth > 420 ? 'flex' : 'block'
        }}>
          <Base >
            <Header />
            <Messages />
            <MessageInput />
          </Base>
          {process.env.NODE_ENV !== 'production' && <Debug />}
        </div >
      </Provider >
    )
  }
}

export default App
