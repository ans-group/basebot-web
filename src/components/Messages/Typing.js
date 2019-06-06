import React from 'react'
import styles from './Messages.module.scss'

const Typing = () => (
  <div className={styles.typing}>
    <span className={styles.typingDot} />
    <span className={styles.typingDot} />
    <span className={styles.typingDot} />
  </div>
)

export default Typing
