import React from 'react'
import Input from '../Input'
import styles from './Debug.module.scss'

const Debug = ({ endpoint, updateEndpoint, online, messages }) => {
  const handleBlur = e => {
    const url = e && e.target && e.target.value && e.target.value.replace(/(http:\/\/|https:\/\/)/, '')
    if (!url) return
    updateEndpoint(url)
  }
  return (
    <div className={styles.root}>
      <h4 className={styles.status}>
        <strong>Bot Status: </strong> {online ? 'Online' : 'Offline'}
      </h4>
      <label>Endpoint URL</label>
      <Input className={styles.input} defaultValue={endpoint} onBlur={handleBlur} />
      <div className={styles.messages}>
        {messages.map(message => (
          <div className={message} key={message.timestamp}>
            <pre>
              {JSON.stringify(message, null, 4)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}


export default Debug
