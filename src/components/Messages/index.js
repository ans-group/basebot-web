import React from 'react'
import propTypes from 'prop-types'
import classNames from 'classnames'
import { Transition, TransitionGroup } from 'react-transition-group'
import styles from './Messages.module.scss'
import Message from './Message'
import Typing from  './Typing'

const duration = 250

const defaultStyle = {
  transition: `all ${duration}ms ease-in-out`,
  opacity: 0,
  transform: 'translateY(1.5rem)'
}

const transitionStyles = {
  entering: { opacity: 1, transform: 'translateY(0)' },
  entered: { opacity: 1, transform: 'translateY(0)' },
  exiting: { opacity: 0, transform: 'translateY(1.5rem)' },
  exited: { opacity: 0, transform: 'translateY(1.5rem)' }
}

class Messages extends React.Component {
  constructor (props) {
    super(props)
    props.connect()
  }

  componentDidMount () {
    this.scrollToBottom()
  }

  componentDidUpdate () {
    this.scrollToBottom()
  }

  scrollToBottom () {
    this.el.scrollTo({
      top: this.el.scrollHeight,
      behavior: 'smooth'
    })
  }

  render () {
    const { messages } = this.props
    return (
      <div className={styles.container} ref={el => {
                                         this.el = el
                                       }}>
        <TransitionGroup className={styles.root}>
          {messages.map(message => (
            <Transition timeout={duration} key={message.timestamp}>
              {state => <Message from={message.from} text={message.text} style={{...defaultStyle, ...transitionStyles[state]}} />}
            </Transition>
           ))}
          {messages[messages.length - 1] && messages[messages.length -1].typing && (
            <Transition timeout={duration}>
              {state => <Typing style={{...defaultStyle, ...transitionStyles[state]}} />}
            </Transition>
          )}
        </TransitionGroup>
      </div>
    )
  }
}

Messages.propTypes = {
  // TODO
  // messages: propTypes.arrayOf()
}

export default Messages
