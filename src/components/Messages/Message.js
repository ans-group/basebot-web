import React from 'react'
import classNames from 'classnames'
import { markdown } from 'markdown'
import styles from './Messages.module.scss'

const Message = ({from, text, style}) => {
  const classes = classNames(
    styles.message,
    {[styles.fromUser]: from === 'user'}
  )

  return (
    <div className={classes} style={style} dangerouslySetInnerHTML={{__html: markdown.toHTML(text)}} />
  )
}

export default Message
