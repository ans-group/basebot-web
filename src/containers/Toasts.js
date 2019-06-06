import { connect } from 'react-redux'
import { REMOVE_TOAST } from '../ducks/toasts'
import Toast from '../components/Toast'

const mapStateToProps = state => {
  return {
    toasts: Object.values(state.toasts.byId)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    remove: id => dispatch(REMOVE_TOAST({ id}))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Toast)
