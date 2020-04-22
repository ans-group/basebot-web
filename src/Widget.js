import React from 'react'
import classNames from 'classnames'
import propTypes from 'prop-types'
import styles from './styles/Frame.module.scss'

const Widget = ({open}) => {
  const openChat = () => {
    window.parent.postMessage('TOGGLE_CHAT', window.location.origin)
  }
  const classes = classNames(
    styles.widget,
    { [styles.activeWidget]: open },
    { [styles.widgetMobile]: window.innerWidth <= 620 }
  )

  return (
    <div
      className={classes}
      onClick={openChat}
      onKeyUp={openChat}
      role='button'
      tabIndex={0}>
      <svg
        version='1.1'
        className={styles.chatIcon}
        x='0px'
        y='0px'
        viewBox='0 0 473 473'
        xmlSpace='preserve'>
        <path d='M403.581,69.3c-44.7-44.7-104-69.3-167.2-69.3s-122.5,24.6-167.2,69.3c-86.4,86.4-92.4,224.7-14.9,318
                    c-7.6,15.3-19.8,33.1-37.9,42c-8.7,4.3-13.6,13.6-12.1,23.2s8.9,17.1,18.5,18.6c4.5,0.7,10.9,1.4,18.7,1.4
                    c20.9,0,51.7-4.9,83.2-27.6c35.1,18.9,73.5,28.1,111.6,28.1c61.2,0,121.8-23.7,167.4-69.3c44.7-44.7,69.3-104,69.3-167.2
                    S448.281,114,403.581,69.3z M384.481,384.6c-67.5,67.5-172,80.9-254.2,32.6c-5.4-3.2-12.1-2.2-16.4,2.1c-0.4,0.2-0.8,0.5-1.1,0.8
                    c-27.1,21-53.7,25.4-71.3,25.4h-0.1c20.3-14.8,33.1-36.8,40.6-53.9c1.2-2.9,1.4-5.9,0.7-8.7c-0.3-2.7-1.4-5.4-3.3-7.6
                    c-73.2-82.7-69.4-208.7,8.8-286.9c81.7-81.7,214.6-81.7,296.2,0C466.181,170.1,466.181,302.9,384.481,384.6z' />
        <circle cx='236.381' cy='236.5' r='16.6' />
        <circle cx='321.981' cy='236.5' r='16.6' />
        <circle cx='150.781' cy='236.5' r='16.6' />
      </svg>
      <svg
        className={styles.cross}
        version='1.1'
        x='0px'
        y='0px'
        viewBox='0 0 64 64'>
        <path fill='#1D1D1B' d='M28.941,31.786L0.613,60.114c-0.787,0.787-0.787,2.062,0,2.849c0.393,0.394,0.909,0.59,1.424,0.59   c0.516,0,1.031-0.196,1.424-0.59l28.541-28.541l28.541,28.541c0.394,0.394,0.909,0.59,1.424,0.59c0.515,0,1.031-0.196,1.424-0.59   c0.787-0.787,0.787-2.062,0-2.849L35.064,31.786L63.41,3.438c0.787-0.787,0.787-2.062,0-2.849c-0.787-0.786-2.062-0.786-2.848,0   L32.003,29.15L3.441,0.59c-0.787-0.786-2.061-0.786-2.848,0c-0.787,0.787-0.787,2.062,0,2.849L28.941,31.786z'
        />
      </svg>
    </div>
  )
}

Widget.propTypes = {
  open: propTypes.bool
}

export default Widget
