import React from 'react'
import propTypes from 'prop-types'
import classNames from 'classnames'
import { Transition, TransitionGroup } from 'react-transition-group'
import scrollTo from '../../util/scrollTo'
import styles from './Messages.module.scss'
import Message from './Message'
import Typing from './Typing'
import Rating from './Rating'
import QuickReplies from './QuickReplies'

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
  constructor(props) {
    super(props)
    props.connect()
  }

  componentDidMount() {
    this.scrollToBottom()
    // this.hijackScroll = this.el.addEventListener('touchmove', e => {
    //   e.preventDefault()
    // }, false)
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  componentWillUnmount() {
    // this.el.removeEventListener(this.hijackScroll)
  }

  scrollToBottom() {
    scrollTo(this.el, 1000)
  }

  render() {
    const { messages, sendMessage, rateMessage, rated } = this.props
    const latestMessage = messages[messages.length - 1] || {}
    return (
      <div className={styles.container} ref={el => {
        this.el = el
      }}>
        <TransitionGroup className={styles.root}>
          {messages.map(message => (
            <Transition timeout={duration} key={message.timestamp}>
              {state => (
                <React.Fragment>
                  <Message from={message.from} text={message.text} style={{ ...defaultStyle, ...transitionStyles[state] }} />
                  {message.rateMe && <Rating timestamp={message.timestamp} intent={message.rateMe} rateMessage={rateMessage} rated={rated} style={{ ...defaultStyle, ...transitionStyles[state] }} />}
                </React.Fragment>
              )}
            </Transition>
          ))}
          {latestMessage.typing && (
            <Transition timeout={duration}>
              {state => (
                <Typing style={{ ...defaultStyle, ...transitionStyles[state] }} />
              )}
            </Transition>
          )}
          {latestMessage.quick_replies && (
            <Transition timeout={duration}>
              {state => (
                <QuickReplies sendMessage={sendMessage} style={{ ...defaultStyle, ...transitionStyles[state] }} replies={latestMessage.quick_replies} />
              )}
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
