import React from 'react'
import MicIcon from '../../assets/Mic'
import styles from './MessageInput.module.scss'


const RecordButton = ({ recording, toggleRecording }) => {
  return (
    <MicIcon
      className={styles.mic}
      onClick={toggleRecording}
    />
  )
}

export default RecordButton
