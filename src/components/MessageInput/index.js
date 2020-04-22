import React, { useState } from 'react'
import propTypes from 'prop-types'
import getUserMedia from 'get-user-media-promise'
import classNames from 'classnames'
import styles from './MessageInput.module.scss'
import RecordButton from './RecordButton'
import Input from '../Input'
import Button from '../Button'
import { awsEnabled } from '../../aws.config'

const VoiceSupport = window.webkitSpeechRecognition || window.SpeechRecognition || getUserMedia.isSupported

const MessageInput = ({ sendMessage, connected, recording, toggleRecording }) => {
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
    { [styles.disabled]: !connected },
    { [styles.recording]: recording },
    { [styles.voiceEnabled]: !!VoiceSupport }
  )

  return (
    <div className={classes}>
      <RecordButton
        recording={recording}
        toggleRecording={toggleRecording}
      />
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
  connected: propTypes.bool,
  recording: propTypes.bool,
  toggleRecording: propTypes.func
}

export default MessageInput
