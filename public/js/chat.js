const socket = io()
//elements
const form = document.querySelector('#message-form')
const message = document.querySelector('#message')
const messageButton = document.querySelector('#button')
const button = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const autoscroll = () => {
  //new Message elemnets
  const newMessage = messages.lastElementChild

  //height of new message
  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin
  //visible height
  const visibleHeight = messages.offsetHeight

  //height of messages container
  const contantHeight = messages.scrollHeight

  const scrollOffset = messages.scrollTop + visibleHeight

  if (contantHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on('locationMessage', (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format('h:mm A'),
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A'),
  })
  messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  })
  document.querySelector('#sidebar').innerHTML = html
})
form.addEventListener('submit', (event) => {
  event.preventDefault()
  messageButton.setAttribute('disabled', 'disabled')
  socket.emit('sendMessage', message.value, (error) => {
    messageButton.removeAttribute('disabled')
    message.value = ''
    message.focus()
    if (error) {
      return console.log(error)
    }
    console.log('message Delivered')
  })
})
button.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation isnt supported by your browser')
  }
  button.setAttribute('disabled', ' disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'myLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        button.removeAttribute('disabled')
        console.log('location shared')
      }
    )
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
