import { connect } from 'react-redux'
import { MESSAGE_SEND } from '../ducks/messages'
import MessageInput from '../components/MessageInput'

const mapStateToProps = state => {
  const latestMessage = state.messages.items.length > 0 && state.messages.items[state.messages.items.length - 1]
  return {
    connected: state.messages.serverStatus === 'on' && (!latestMessage || !latestMessage.typing)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: text => dispatch(MESSAGE_SEND(text))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageInput)
