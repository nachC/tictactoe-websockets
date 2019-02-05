const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const User = require('./models/user');

//sets the number of the current available room
let roomNumber = 0;
//holds all users connected to the server
let users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  //USER CONNECTS
  console.log('a user connected');
  users[socket.id] = new User();

  if (io.sockets.adapter.rooms[`room ${roomNumber}`] === undefined
    || io.sockets.adapter.rooms[`room ${roomNumber}`].length < 2) {
    socket.join(`room ${roomNumber}`);
    users[socket.id].room = `room ${roomNumber}`;
    console.log(`user joined room ${roomNumber}`)
    if(io.sockets.adapter.rooms[`room ${roomNumber}`].length === 2) {
      //start game (choose who starts first)
      let firstToPlay = Object.keys(io.sockets.adapter.rooms[users[socket.id].room].sockets)[Math.round(Math.random())];
      users[firstToPlay].activeTurn = true;
    }
  } else {
    roomNumber++;
    socket.join(`room ${roomNumber}`);
    users[socket.id].room = `room ${roomNumber}`;
    console.log(`sent user to room ${roomNumber}`);
  }

  //PLAY EVENT
  socket.on('play turn', (cellId) => {
    //check if it's this player's turn to play
    data = { cellId, activeTurn: users[socket.id].activeTurn }
    if (!users[socket.id].activeTurn) {
      console.log('invalid turn')
      socket.emit('play turn', data);
    } else {
      for(user in io.sockets.adapter.rooms[users[socket.id].room].sockets) {
        if(socket.id == user) {
          users[socket.id].activeTurn = false;
        }else{
          users[user].activeTurn = true;
        }
      }
      //need to save game state
      console.log('valid turn')
      socket.broadcast.to(users[socket.id].room).emit('play turn', data);
    }
  });

  //EVENT FOR USER DISCONNECTED
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});