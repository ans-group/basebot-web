import React from 'react'
import classNames from 'classnames'
import propTypes from 'prop-types'
import styles from './Base.module.scss'
import Toasts from '../../containers/Toasts'

const classes = classNames(
  styles.root,
  { [styles.desktop]: window.innerWidth > 620 }
)

const Base = ({ children, ...otherProps }) => (
  <div className={classes} {...otherProps} style={{ maxWidth: process.env.NODE_ENV === 'production' ? 'none' : '40rem' }}>
    {children}
    <Toasts position='bottomRight' />
  </div>
)

Base.propTypes = {
  children: propTypes.any
}

export default Base
