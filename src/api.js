import axios from 'axios'
import uuidv1 from 'uuid/v1'

function generateGuid() {
  const id = uuidv1()
  localStorage.setItem('basebotGuid', id)
  return id
}

class SocketClient {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.guid = localStorage.getItem('basebotGuid') || generateGuid()
    this.connected = false

    this.handlers = {
      message: [],
      reconnect: [],
      close: [() => {
        this.connected = false
      }],
      error: [(err) => {
        console.error(err)
        this.connected = false
      }],
      open: [() => {
        this.connected = true
      }]
    }
  }

  send = (data) => {
    if (this.connected) {
      console.log('sending ', data)
      this.connection.send(JSON.stringify(data))
    }
  }

  connect = () => {
    this.connection = new WebSocket(this.baseURL)
    this.handlers.close.forEach(handler => this.connection.addEventListener('close', handler))
    this.handlers.error.forEach(handler => this.connection.addEventListener('error', handler))
    this.handlers.message.forEach(handler => this.connection.addEventListener('message', handler))
    this.handlers.open.forEach(handler => this.connection.addEventListener('open', handler))
  }

  on = (event, cb) => {
    if (this.handlers[event]) {
      this.handlers[event].push(cb)
      if (event !== 'reconnect'){
        this.connection.addEventListener(event, cb)
      }
    }
  }

  off = (event, cb) => {
    if (this.handlers[event] && this.handlers[event].includes(cb)) {
      this.handlers[event].splice(this.handlers[event].indexOf(cb), 1)
      if (event !== 'reconnect'){
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
        console.info('reconnected')
        this.handlers.reconnect.forEach(handler => handler())
      }
    }, 2500)
  }
}

const baseURLs = {
  production: document.currentScript 
    ? (document.currentScript && (
      document.currentScript.getAttribute('data-basebotendpoint')
      || (document.currentScript.getAttribute('src') && new URL(document.currentScript.getAttribute('src')).host)
    ))
    : window.location.host,
  development: 'localhost:3000'
}

const protocol = document.currentScript 
    ? (
      document.currentScript
      && document.currentScript.getAttribute('src') 
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