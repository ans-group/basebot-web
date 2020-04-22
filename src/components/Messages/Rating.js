import React from 'react'
import styles from './Messages.module.scss'

const Rating = ({ timestamp, rateMessage, rated, intent, ...otherProps }) => {
  const handleRating = value => () => rateMessage({
    value,
    timestamp,
    intent
  })
  return rated.includes(timestamp)
    ? (
      <div {...otherProps}>
        <span className={styles.rated}>
          Thanks for the feedback!
        </span>
      </div>
    )
    : (
      <div {...otherProps}>
        <span role='img' aria-label='Thumbs Up' className={styles.rating} onClick={handleRating('positive')}>
          👍
        </span>
        <span role='img' aria-label='Thumbs Down' className={styles.rating} onClick={handleRating('negative')}>
          👎
        </span>
      </div>
    )
}

export default Rating
