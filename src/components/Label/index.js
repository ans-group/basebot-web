import React from 'react'
import styles from './Label.module.scss'

const Label = ({ children, className, ...otherProps }) => (
  <label className={[styles.root, className].join(' ')} {...otherProps}>
    {children}
  </label>
)

export default Label