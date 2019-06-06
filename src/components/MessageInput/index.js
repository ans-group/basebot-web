import React, { useState } from 'react'
import propTypes from 'prop-types'
import classNames from 'classnames'
import styles from './MessageInput.module.scss'
import Input from '../Input'
import Button from '../Button'

const MessageInput = ({ sendMessage, connected }) => {
  const [text, setText] = useState('')

  const handleSend = e => {
    if (text) {
      sendMessage(text)
      setText('')
    }
  }

  const handleKeyUp = e => {
    if (e.keyCode === 13 && text) {
      sendMessage(text)
      setText('')
    }
  }

  const classes = classNames(
    styles.root,
    {[styles.disabled]: !connected}
  )

  return (
    <div className={classes}>
      <Input
        type='text'
        value={text}
        onKeyUp={handleKeyUp}
        onChange={e => setText(e.target.value)}
        disabled={!connected}
        className={styles.input}
        placeholder='Chat here...' />
      <Button
        className={styles.button}
        icon='Send'
        onClick={handleSend}
        disabled={!connected} />
    </div>
  )
}

MessageInput.propTypes = {
  sendMessage: propTypes.func.isRequired,
  connected: propTypes.bool
}

export default MessageInput
