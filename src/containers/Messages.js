import { connect } from 'react-redux'
import { MESSAGE_CHANNEL_START } from '../ducks/messages'
import Messages from '../components/Messages'

const mapStateToProps = state => {
  return {
    connected: state.messages.serverStatus === 'on',
    messages: state.messages.items
  }
}

const mapDispatchToProps = dispatch => {
  return {
    connect: () => dispatch(MESSAGE_CHANNEL_START())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Messages)
