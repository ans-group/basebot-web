import { connect } from 'react-redux'
import { MESSAGE_CHANNEL_START, MESSAGE_SEND, RATE_MESSAGE } from '../ducks/messages'
import Messages from '../components/Messages'

const mapStateToProps = state => {
  return {
    connected: state.messages.serverStatus === 'on',
    messages: state.messages.items,
    rated: state.messages.rated
  }
}

const mapDispatchToProps = dispatch => {
  return {
    connect: () => dispatch(MESSAGE_CHANNEL_START()),
    sendMessage: text => dispatch(MESSAGE_SEND(text)),
    rateMessage: payload => dispatch(RATE_MESSAGE(payload))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages)
