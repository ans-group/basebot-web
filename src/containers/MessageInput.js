import { connect } from 'react-redux'
import { MESSAGE_SEND, DISABLE_SPEECH } from '../ducks/messages'
import { TOGGLE_RECORDING } from '../ducks/audio'
import MessageInput from '../components/MessageInput'

const mapStateToProps = state => {
  const latestMessage = state.messages.items.length > 0 && state.messages.items[state.messages.items.length - 1]
  return {
    connected: state.messages.serverStatus === 'on' && (!latestMessage || !latestMessage.typing),
    recording: state.audio.recording
  }
}

const mapDispatchToProps = dispatch => {
  return {
    sendMessage: text => {
      dispatch(MESSAGE_SEND(text))
      dispatch(DISABLE_SPEECH())
    },
    toggleRecording: () => dispatch(TOGGLE_RECORDING())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageInput)
