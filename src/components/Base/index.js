import React from 'react'
import propTypes from 'prop-types'
import styles from './Base.module.scss'
import Toasts from '../../containers/Toasts'

const Base = ({ children, ...otherProps }) => (
  <div className={styles.root} {...otherProps} style={{ maxWidth: process.env.NODE_ENV === 'production' ? 'none' : '40rem' }}>
    {children}
    <Toasts position='bottomRight' />
  </div>
)

Base.propTypes = {
  children: propTypes.any
}


export default Base
