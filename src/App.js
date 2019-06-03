import React from 'react'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { all } from 'redux-saga/effects'
import { configureStore, getDefaultMiddleware } from 'redux-starter-kit'
import logger from 'redux-logger'

import Base from './components/Base'
import Messages from './containers/Messages'
import MessageInput from './containers/MessageInput'
import Header from './components/Header'
import messagesReducer, { saga as messagesSaga } from './ducks/messages'
import toastsReducer from './ducks/toasts'

// Redux/Saga
const sagaMiddleware = createSagaMiddleware()

function * rootSaga () {
  yield all([
    messagesSaga()
  ])
}

const middleware = [
  ...getDefaultMiddleware(),
  sagaMiddleware
]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(logger)
}
const store = configureStore({
  reducer: {
    toasts: toastsReducer,
    messages: messagesReducer
  },
middleware})

sagaMiddleware.run(rootSaga)

// End Redux/Saga

const mapDispatchToProps = dispatch => {
  return {
    restoreSession: ({ id, token }) => dispatch(LOGIN_RESTORED({ id, token}))
  }
}

class App extends React.Component {
  render () {
    return (
      <Provider store={store}>
        <Base>
          <Header />
          <Messages />
          <MessageInput />
        </Base>
      </Provider>
    )
  }
}

export default App
