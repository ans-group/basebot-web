import axios from 'axios'
import uuidv1 from 'uuid/v1'

function generateGuid() {
  const id = uuidv1()
  localStorage.setItem('basebotGuid', id)
  return id
}

class SocketClient {
  constructor(baseURL) {
    if (this.instance) return this.instance
    this.instance = this
    this.baseURL = baseURL
    this.token = localStorage.getItem('currentUser')
    this.connected = false
    this.connectInvoked = false
    this.heartbeatInterval = 30000

    this.handlers = {
      message: [({ data }) => {
        const { event } = JSON.parse(data)
        if (event === 'pong') {
          setTimeout(this.heartbeat, this.heartbeatInterval)
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
        clearTimeout(this.pingTimeout)
      }],
      open: [(e) => {
        this.connected = true
        this.heartbeat()
      }]
    }
  }

  heartbeat = () => {
    this.connection.send('ping')
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(() => {
      console.warn('skipped a heartbeat')
      this.connected = false
      this.handlers.close.forEach(handler => handler())
    }, this.heartbeatInterval + 2000)
  }

  send = (data) => {
    if (this.connected) {
      this.connection.send(data)
    }
  }

  connect = () => {
    this.connectInvoked = true
    this.connection = new WebSocket(this.baseURL, this.token)
    this.handlers.close.forEach(handler => this.connection.addEventListener('close', handler))
    this.handlers.error.forEach(handler => this.connection.addEventListener('error', handler))
    this.handlers.message.forEach(handler => this.connection.addEventListener('message', handler))
    this.handlers.open.forEach(handler => this.connection.addEventListener('open', handler))
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

  reconnect = () => {
    console.info('attempting reconnect...')
    this.connect()
    this.onAsync('reconnect')
    setTimeout(() => {
      if (!this.connected) {
        this.reconnect()
      } else {
        this.heartbeat()
        this.handlers.reconnect.forEach(handler => handler())
      }
    }, 4000)
  }
}

const baseURLs = {
  production: document.currentScript
    ? (
      document.currentScript
      && (
        document.currentScript.getAttribute('data-basebotendpoint')
        || (
          document.currentScript.getAttribute('src')
          && isURL(document.currentScript.getAttribute('src'))
          && new URL(document.currentScript.getAttribute('src')).host
        )
      )
    )
    : window.location.host,
  development: 'localhost:3000'
}

const protocol = document.currentScript
  ? (
    document.currentScript
    && document.currentScript.getAttribute('src')
    && isURL(document.currentScript.getAttribute('src'))
    && new URL(document.currentScript.getAttribute('src')).protocol
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


function getValue(from) {
  return from[process.env.NODE_ENV] || from.development
}



function isURL(str) {
  if (str === 'main.js') return false
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}
