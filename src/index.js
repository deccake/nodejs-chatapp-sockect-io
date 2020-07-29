const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { genrateLocationMsg, genrateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirctoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirctoryPath));

io.on("connection", (socket) => {
  console.log("sockectio connection ");

  socket.on("join", ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }
    socket.join(user.room);

    socket.emit("message", genrateMessage("Welcome!", user.username));
    socket.broadcast.to(user.room).emit("message", genrateMessage(`${user.username} has joined!`, user.username));
    io.to(user.room).emit("roomData", {
      room: user.room,
      usersIn: getUsersInRoom(user.room),
    });
    cb();
  });

  socket.on("sendMessage", (msg, cb) => {
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb("Message is rejected!");
    }
    const user = getUser(socket.id);
    io.to(user.room).emit("message", genrateMessage(msg, user.username));
    cb();
  });

  socket.on("sendLocation", (location, cb) => {
    const user = getUser(socket.id);
    io.to(user.room).emit("url", genrateLocationMsg(location, user.username));
    cb("Location share!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (!user) {
      return;
    }
    io.to(user.room).emit("message", genrateMessage(`${user.username} has left!`, user.username));
    io.to(user.room).emit("roomData", {
      room: user.room,
      usersIn: getUsersInRoom(user.room),
    });
  });
});

server.listen(port, () => {
  console.log("Server is started on port " + port);
});
