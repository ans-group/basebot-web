import React from 'react'
import Linkify from 'react-linkify'
import classNames from 'classnames'
import Markdown from 'react-markdown'
import styles from './Messages.module.scss'

const Message = ({ from, text, style }) => {
  const classes = classNames(
    styles.message,
    { [styles.fromUser]: from === 'user' }
  )

  return (
    <Linkify properties={{
      target: '_blank',
      rel: 'noopener noreferrer'
    }}>
      <Markdown
        className={classes}
        linkTarget='_blank'
        style={style}
        source={text}
        escapeHtml={false}
        disallowedTypes={['html']}
      />
    </Linkify>
  )
}

export default Message
