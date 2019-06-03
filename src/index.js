import React from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'

import Frame from './containers/Frame'
import App from './App'
import Widget from './Widget'
import styles from './styles/Frame.module.scss'

const root = document.createElement('div')
root.setAttribute('id', 'root')
document.body.appendChild(root)

class Container extends React.Component {
  constructor(props){ 
    super(props)

    this.state = { open: false }

    window.addEventListener('message', (e) => {
      if (e.data === 'TOGGLE_CHAT') {
        this.toggleChatPane() 
      }
    }, false)
  }

  toggleChatPane = () => {
    if (this.state.open) {
      this.hideChatPane()
    } else {
      this.showChatPane()
    }
  }

  showChatPane = () => {
    this.setState({
      open: true
    })
    document.addEventListener('click', this.hideChatPane)
  }

  hideChatPane = () => {
    this.setState({
      open: false
    })
    document.removeEventListener('click', this.hideChatPane)
  }

  render() {
    const classes = classNames(
      styles.chatPane,
      {[styles.openChatPane]: this.state.open}
    )
    return process.env.NODE_ENV === 'production'
    ? (
      <React.Fragment>
        <Frame className={classes} style={{position: 'fixed', display: 'none'}} id="BASEBOT_CHAT_PANE">
          <App />
        </Frame>
        <Frame className={styles.widgetFrame} style={{position: 'fixed', display: 'none'}}>
          <Widget open={this.state.open} />
        </Frame>
      </React.Fragment>
    )
    : (<App />)
  }
}

ReactDOM.render(
  <Container />,
  document.getElementById('root'))
