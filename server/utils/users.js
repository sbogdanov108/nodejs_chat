class Users {
  constructor () {
    this.users = [];
  }

  addUser (id, name, room) {
    var user = {id, name, room};
    this.users.push(user);

    return user;
  }

  removeUser (id) {
    var user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.id !== id); // возвращаем всех юзеров, кроме совпавшего по ид
    }

    return user;
  }

  getUser (id) {
    return this.users.filter((user) => user.id === id)[0];
  }

  getUserList (room) {
    var users = this.users.filter((user) => user.room === room); // ищем всех юзеров в определенной комнате
    var namesArray = users.map((user) => user.name); // получаем массив имен

    return namesArray;
  }
}

module.exports = {Users};