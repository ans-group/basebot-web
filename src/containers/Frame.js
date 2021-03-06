import React, { useState, Fragment, createElement, cloneElement } from 'react'
import propTypes from 'prop-types'
import ReactHtmlParser from 'react-html-parser';
import { createPortal } from 'react-dom'

const rootStyles = `
:focus {
  outline: $primaryColor solid 1px;
}

html {
  font-size: 62.5%;
  font-family: "Roboto",Arial,"Helvetica Neue",Helvetica,sans-serif;
  background: transparent;
}

body {
  background: transparent;
  font-size: 1.6em;
  overflow: hidden;
}
body * {
    font-family: "Roboto",Arial,"Helvetica Neue",Helvetica,sans-serif;
    font-weight: 300;
    font-size: 1.4rem;
    box-sizing: border-box;
  }

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
}

h1,h2,h3,h4,h5,h6 {
  margin-bottom: 1em;
  margin-top: 0;
  font-weight: 500;
  color: #333;
}

h1 {
  font-size: 2.5rem;
}

h2 {
  font-size: 2.3rem;
}

h3 {
  font-size: 2.1rem;
}

h4 {
  font-size: 1.9rem;
}

h5 {
  font-size: 1.7rem;
}

h6 {
  font-size: 1.5rem;
}

p {
  margin-top: 0;
  max-width: 70rem;
  font-size: 2.4rem;
  font-weight: 100;
  line-height: 1.5;
  letter-spacing: 0.02em;
  margin: 0 auto 2rem;
}

::placeholder {
  color: #ddd;
}
`

const IFrame = ({ children, ...props }) => {
  const [contentRef, setContentRef] = useState(null)
  const mountNode = contentRef && contentRef.contentWindow.document.body
  const headNode = contentRef && contentRef.contentWindow.document.head
  const styles = [...document.getElementsByClassName('BasebotTag')].map(item => item.outerHTML.toString()).join('')
  return (
    <iframe title='chat' {...props} ref={setContentRef} src={navigator.userAgent.includes('Firefox') ? `javascript:&nbsp;` : ``}>
      {headNode &&
        createPortal(
          <Fragment>
            <meta charSet='utf-8' />
            <meta name='viewport' content='width=device-width,minimum-scale=1.0,maximum-scale=1.0,initial-scale=1.0' />
            <meta name='MobileOptimized' content='320' />
            <link href='https://fonts.googleapis.com/css?family=Roboto:300,500,900&display=swap' rel='stylesheet' />
            <link href='https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css' rel='stylesheet' />
            {ReactHtmlParser(styles)}
            <style>
              {rootStyles}
            </style>
          </Fragment>,
          headNode
        )}
      {mountNode &&
        createPortal(
          React.Children.only(children),
          mountNode
        )}
    </iframe>
  )
}

IFrame.propTypes = {
  children: propTypes.node.isRequired
}

export default IFrame
