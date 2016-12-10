require('./config/config');

const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT;

var app = express();

/* Создаем http-сервер для использования его вместе с socket.io */
var server = http.createServer(app);
var io = socketIO(server);

var users = new Users();

app.use(express.static(publicPath));

/* Событие при подключении клиента к серверу */
io.on('connection', (socket) => {

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Имя и название комнаты обязательны к заполнению'); // отрпавится на клиент
    }

    /* Присоединяемся к определенной комнате */
    socket.join(params.room);

    users.removeUser(socket.id); // Удаляем юзера из других комнат

    /* Добавляем нового юзера */
    users.addUser(socket.id, params.name, params.room);

    /* Отправляем всем в определенной комнате */
    io.to(params.room).emit('updateUserList', users.getUserList(params.room));

    /* Броадкаст текущему сокету */
    socket.emit('newMessage', generateMessage('Админ', 'Добро пожаловать в Чат!'));

    /* Броадкаст сообщения всем в определенной комнате, кроме этого сокета */
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Админ', `Присоединился новый пользователь - ${params.name}`));

    callback();
  });

  /* Новое сообщение */
  socket.on('createMessage', (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      /* Броадкаст сообщения всем в определенной комнате */
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }

    callback();
  });

  /* Новое сообщение с местонахождением*/
  socket.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
    }
  });

  /* Клиент отключился от сервера */
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      /* Отправляем всем в определенной комнате */
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Админ', `${user.name} покинул чат`));
    }
  });
});

server.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});
