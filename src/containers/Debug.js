import { connect } from 'react-redux'
import { UPDATE_ENDPOINT, UPDATE_LOGGING } from '../ducks/debug'
import Debug from '../components/Debug'

const mapStateToProps = state => {
  return {
    logging: state.debug.logging,
    endpoint: state.debug.endpoint,
    online: state.messages.serverStatus === 'on',
    lastUpdated: state.messages.lastUpdated,
    messages: state.messages.items && state.messages.items.slice().reverse()
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateEndpoint: endpoint => dispatch(UPDATE_ENDPOINT(endpoint)),
    updateLogging: status => dispatch(UPDATE_LOGGING(status))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Debug)
