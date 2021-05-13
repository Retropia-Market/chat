const socket = io();

const $messageForm = document.querySelector('#message-form');
const $messageFormButton = document.querySelector('button');
const $messageFormInput = document.querySelector('input');
const $sendLocationButton = document.querySelector('#send-location');
const $message = document.querySelector('#messages');

// Temapltes
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $message.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', (location) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    url: location.url,
    createdAt: moment(location.createdAt).format('h:mm a'),
  });
  $message.insertAdjacentHTML('beforeend', html);
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Disable button while sending the message
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, () => {
    // Reenable the button
    console.log('Message delivered');
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(({ coords }) => {
    const { latitude, longitude } = coords;
    socket.emit('sendLocation', { latitude, longitude }, () => {
      console.log('Location Shared');
      $sendLocationButton.removeAttribute('disabled');
    });
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
  }
});
