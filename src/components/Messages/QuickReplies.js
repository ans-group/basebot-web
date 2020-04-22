import React from 'react'
import styles from './Messages.module.scss'

const QuickReplies = ({ replies, sendMessage, ...otherProps }) => {
  return (
    <div className={styles.quickReplies} {...otherProps}>
      {replies.map(({ title, payload }) => (
        <div className={styles.quickReply} key={payload} onClick={() => sendMessage(payload)}>
          {title}
        </div>
      ))}
    </div>
  )
}

export default QuickReplies
