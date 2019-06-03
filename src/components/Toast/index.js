import React, { useEffect } from 'react'
import classNames from 'classnames'
import propTypes from 'prop-types'
import styles from './Toast.module.scss'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

const toastSchema = propTypes.shape({
  status: propTypes.oneOf(['success', 'warning', 'error']),
  title: propTypes.string.isRequired,
  text: propTypes.string
})

const Toast = ({ toast }) => {
  const { status, title, text } = toast
  const classes = classNames(
    styles.toastRoot,
    { [styles.success]: status === 'success' },
    { [styles.warning]: status === 'warning' },
    { [styles.error]: status === 'error' }
  )
  return (
    <div className={classes}>
      <h6 className={styles.title}>{title}</h6>
      {text && <p className={styles.text}>
        {text}
      </p>}
    </div>
  )
}

Toast.propTypes = {
  toast: toastSchema
}

const ToastContainer = ({ position, toasts, remove, duration }) => {
  const queue = []

  const removeItem = id => () => {
    remove(id)
    const index = queue.indexOf(id)
    if (index > -1) {
      queue.splice(index, 1)
    }
  }

  const addToQueue = ({ id }) => {
    if (remove && !queue[id]) {
      queue.push(id)
      setTimeout(removeItem(id), duration)
    }
  }

  useEffect(() => {
    toasts.forEach(addToQueue)
  }, [toasts])

  const classes = classNames(
    styles.root,
    { [styles.topLeft]: position === 'topLeft' },
    { [styles.topRight]: position === 'topRight' },
    { [styles.topCenter]: position === 'topCenter' },
    { [styles.bottomLeft]: position === 'bottomLeft' },
    { [styles.bottomRight]: position === 'bottomRight' },
    { [styles.bottomCenter]: position === 'bottomCenter' }
  )
  return (
    <TransitionGroup className={classes}>
      {toasts.map((toast, i) => (
        <CSSTransition key={i} timeout={300} classNames={styles}>
           <Toast toast={toast} />
         </CSSTransition>
       ))}
    </TransitionGroup>
  )
}

ToastContainer.defaultProps = {
  position: 'topCenter',
  duration: 4000,
  toasts: []
}

ToastContainer.propTypes = {
  position: propTypes.oneOf(['topLeft', 'topRight', 'topCenter', 'bottomRight', 'bottomLeft', 'bottomCenter']),
  duration: propTypes.number,
  toasts: propTypes.arrayOf(toastSchema),
  remove: propTypes.func
}

export default ToastContainer
