/* global WebSocket localStorage */
import axios from 'axios'
import uuidv1 from 'uuid/v1'
import ReactGA from 'react-ga'

function generateGuid () {
  const id = uuidv1()
  localStorage.setItem('basebotGuid', id)
  return id
}

class SocketClient {
  constructor (baseURL) {
    if (this.instance) return this.instance
    this.instance = this
    this.baseURL = baseURL
    this.guid = localStorage.getItem('basebotGuid') || generateGuid()
    ReactGA.set({ userId: this.guid })
    this.connected = false
    this.connectInvoked = false

    this.handlers = {
      message: [({ data }) => {
        const { event } = JSON.parse(data)
        if (event === 'pong') {
          this.heartbeat()
        }
      }],
      reconnect: [],
      close: [() => {
        this.connected = false
        clearTimeout(this.pingTimeout)
      }],
      error: [(err) => {
        /* eslint-disable-next-line */
        console.error(err)
        this.connected = false
        if (this.connection) {
          this.connection.close()
        }
        clearTimeout(this.pingTimeout)
      }],
      open: [(e) => {
        this.connected = true
        this.heartbeat()
      }]
    }
  }

  heartbeat = () => {
    clearTimeout(this.pingTimeout)
    clearTimeout(this.failTimeout)
    this.pingTimeout = setTimeout(() => {
      this.send('ping')
      this.failTimeout = setTimeout(() => {
        console.warn(`skipped a heartbeat`)
        this.connected = false
        this.connection.close()
        this.handlers.close.forEach(handler => handler())
      }, 5000)
    }, 5000)
  }

  send = (data) => {
    if (this.connected && this.connection.readyState === 1) {
      this.connection.send(data)
    }
  }

  connect = () => {
    this.connectInvoked = true
    const connection = new WebSocket(this.baseURL)
    this._bindListeners(connection)
  }

  on = (event, cb) => {
    if (this.handlers[event]) {
      this.handlers[event].push(cb)
      if (event !== 'reconnect' && this.connection) {
        this.connection.addEventListener(event, cb)
      }
    }
  }

  off = (event, cb) => {
    if (this.handlers[event] && this.handlers[event].includes(cb)) {
      this.handlers[event].splice(this.handlers[event].indexOf(cb), 1)
      if (event !== 'reconnect') {
        this.connection.removeEventListener(event, cb)
      }
    }
  }

  onAsync = (event) => new Promise((resolve) => { this.on(event, resolve) })

  reconnect = (baseURL) => {
    console.log('connection lost.. reconnecting')
    this.baseURL = baseURL || this.baseURL
    this.reconnecting = true
    if (this.connection) {
      this.connection.close()
      this.handlers.close.forEach(handler => handler())
    }
    this.connect()
    setTimeout(() => {
      this._pollConnection()
      if (this.connected) {
        console.log('reconnection successful')
        this.reconnecting = false
        localStorage.setItem('lastBasebotEndpoint', this.baseURL.replace('\/socket', ''))
        this.handlers.reconnect.forEach(handler => handler())
        this.heartbeat()
      } else {
        console.log('reconnection unsuccsessful')
        this.reconnect()
      }
    }, 2000)
  }

  _pollConnection = () => {
    if (this.connection.readyState === 1) {
      this.connected = true
    }
  }

  _bindListeners = connection => {
    this.handlers.close.forEach(handler => connection.addEventListener('close', handler))
    this.handlers.error.forEach(handler => connection.addEventListener('error', handler))
    this.handlers.message.forEach(handler => connection.addEventListener('message', handler))
    this.handlers.open.forEach(handler => connection.addEventListener('open', handler))
    if (this.connection) {
      this.handlers.close.forEach(handler => this.connection.removeEventListener('close', handler))
      this.handlers.error.forEach(handler => this.connection.removeEventListener('error', handler))
      this.handlers.message.forEach(handler => this.connection.removeEventListener('message', handler))
      this.handlers.open.forEach(handler => this.connection.removeEventListener('open', handler))
    }
    this.connection = connection
  }
}

const baseURLs = {
  production: document.currentScript
    ? (
      document.currentScript &&
      (
        document.currentScript.getAttribute('data-basebotendpoint') ||
        (
          document.currentScript.getAttribute('src') &&
          isURL(document.currentScript.getAttribute('src')) &&
          new URL(document.currentScript.getAttribute('src')).host
        )
      )
    )
    : window.location.host,
  development: localStorage.getItem('lastBasebotEndpoint') ? localStorage.getItem('lastBasebotEndpoint').replace(/(wss:\/\/|ws:\/\/)/, '') : 'localhost:3000'
}

const protocol = document.currentScript
  ? (
    document.currentScript &&
    document.currentScript.getAttribute('src') &&
    isURL(document.currentScript.getAttribute('src')) &&
    new URL(document.currentScript.getAttribute('src')).protocol
  )
  : window.location.protocol

const baseURL = `${protocol}//${getValue(baseURLs)}`
const socketURL = `${protocol === 'https:' ? 'wss:' : 'ws:'}//${getValue(baseURLs)}/socket`

const socketAPI = new SocketClient(socketURL)
const restAPI = axios.create({ baseURL })

const updateToken = (token) => {
  historyClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  restAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
  if (socketAPI.token !== token) {
    socketAPI.token = token
    socketAPI.reconnect()
  }
}

export { socketAPI, restAPI, updateToken }

function getValue (from) {
  return from[process.env.NODE_ENV] || from.development
}

function isURL (str) {
  if (str === 'main.js') return false
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return pattern.test(str)
}
