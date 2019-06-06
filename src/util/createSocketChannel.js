import { eventChannel } from 'redux-saga'

export default (socket, resource) => eventChannel((emit) => {
  const handler = ({data}) => {
    emit(data)
  }
  socket.on(resource, handler)
  return () => {
    console.log('cleaning up')
    socket.off(resource, handler)
  }
})
