var socket = io(); // открываем соединение

/* Прокрутка сообщений */
function scrollToBottom() {
  var messages = $('#messages');
  var newMessage = messages.children('li:last-child');

  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();

  if ((clientHeight + scrollTop + newMessageHeight + lastMessageHeight) >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

/* Событие при подключении к серверу */
socket.on('connect', function() {
  var params = $.deparam(window.location.search); // парсим параметры из урла

  socket.emit('join', params, function(err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    }
    else {
      console.log('ok');
    }
  });
});

/* Событие при отключении от сервера */
socket.on('disconnect', function() {
  console.log('Disconnected from server');
});

/* Обновление списка юзеров */
socket.on('updateUserList', function(users) {
  var ol = $('<ol></ol>');

  users.forEach(function(user) {
    ol.append($('<li></li>').text(user));
  });

  $('#users').html(ol);
});

/* Кастомное событие от сервера */
socket.on('newMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('H:mm:ss');
  var template = $('#message-template').html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

/* Событие от сервера */
socket.on('newLocationMessage', function(message) {
  var formattedTime = moment(message.createdAt).format('H:mm:ss');
  var template = $('#location-message-template').html();
  var html     = Mustache.render(template, {
    from     : message.from,
    url: message.url,
    createdAt: formattedTime
  });

  $('#messages').append(html);
  scrollToBottom();
});

/* Отправка сообщения */
$('#message-form').on('submit', function(e) {
  e.preventDefault();

  var messageTextbox = $('[name=message]');

  socket.emit('createMessage', {
    from: 'User',
    text: messageTextbox.val()
  }, function() {
    messageTextbox.val(''); // очищаем поле ввода
  });
});

var locationButton = $('#send-location');

locationButton.on('click', function(e) {
  if (!navigator.geolocation) {
    return alert('Геолокация не поддерживается вашим браузером.');
  }

  locationButton.attr('disabled', 'disabled').text('Где я...');

  /* Определяем координаты пользователя */
  navigator.geolocation.getCurrentPosition(function(position) {
    locationButton.removeAttr('disabled').text('Где я?');

    socket.emit('createLocationMessage', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });
  }, function() {
    locationButton.removeAttr('disabled').text('Где я?');

    alert('Ошибка при определении позиции.');
  })
});