import { eventChannel } from 'redux-saga'

export default (socket, resource) => eventChannel((emit) => {
  const handler = (e) => {
    emit(e ? (e.data || e) : resource)
  }
  socket.on(resource, handler)
  return () => {
    console.log('cleaning up')
    socket.off(resource, handler)
  }
})
