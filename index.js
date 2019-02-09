const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const User = require('./models/user');
const GameState = require('./models/game-state');

//sets the number of the current available room
let roomNumber = 0;
//holds all clients connected to the server - { client : new User() }
let users = {};
//holds the game state for each room  - { room : new GameState(...) }
let roomsGameState = {};

let players = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  //USER CONNECTS
  console.log('a user connected');
  users[socket.id] = new User();

  if (io.sockets.adapter.rooms[`room ${roomNumber}`] === undefined || io.sockets.adapter.rooms[`room ${roomNumber}`].length < 2) {
    players[socket.id] = false;

    users[socket.id].room = `room ${roomNumber}`;
    socket.join(`room ${roomNumber}`);
    console.log(`user joined room ${roomNumber}`);

    if (io.sockets.adapter.rooms[`room ${roomNumber}`].length === 2) {
      players[socket.id] = false;
      //start game (choose who starts first)
      let firstToPlay = Object.keys(io.sockets.adapter.rooms[users[socket.id].room].sockets)[Math.round(Math.random())];
      users[firstToPlay].activeTurn = true;
      players[firstToPlay] = true;
      //set this room's GameState
      roomsGameState[`room ${roomNumber}`] = new GameState(players);
    }
  } else {
    players = {}; //reset players object for new room
    players[socket.id] = false;

    roomNumber++;
    users[socket.id].room = `room ${roomNumber}`;
    socket.join(`room ${roomNumber}`);
    console.log(`sent user to room ${roomNumber}`);
  }

  //PLAY EVENT
  socket.on('play turn', (cellId) => {
    if (!roomsGameState[users[socket.id].room].play(socket.id, cellId).error.exists) {
      //if it's a valid turn -> play
      console.log('valid turn')
      socket.emit('valid turn', 'O');
      socket.broadcast.to(users[socket.id].room).emit('play turn', {
        cellId,
        activeTurn: true
      });
    } else {
      //if it's an invalid turn -> error
      console.log('invalid turn')
      console.log(roomsGameState[users[socket.id].room].play(socket.id, cellId).error.message)
      socket.emit('play turn', {
        activeTurn: false,
        errorMsg: roomsGameState[users[socket.id].room].play(socket.id, cellId).error.message
      });
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