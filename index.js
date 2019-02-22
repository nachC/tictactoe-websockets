const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

const User = require('./models/user');
const GameState = require('./models/game-state');

//sets the number of the current available room
let roomNumber = 0;
//holds all users connected to the server - { user : new User() }
let users = {};
//holds the game state for each room  - { room : new GameState(...) }
let roomsGameState = {};
//hold pair of clients that belong to same room.
//gets resetted after GameState is created for that room and a new room 'opens'
let players = {};

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  //USER CONNECTS
  users[socket.id] = new User();

  if (io.sockets.adapter.rooms[`room ${roomNumber}`] === undefined
    || io.sockets.adapter.rooms[`room ${roomNumber}`].length < 2) {

    players[socket.id] = false;
    users[socket.id].room = `room ${roomNumber}`;
    socket.join(`room ${roomNumber}`);

    //console.log('players', players);

    if (io.sockets.adapter.rooms[`room ${roomNumber}`].length === 2) {
      //start game (choose who starts first)
      let firstToPlay = Object.keys(io.sockets.adapter.rooms[users[socket.id].room].sockets)[Math.round(Math.random())];
      players[firstToPlay] = true;
      for (let p in io.sockets.adapter.rooms[users[socket.id].room].sockets) {
        if (p === firstToPlay) {
          users[firstToPlay].symbol = 'X';
        } else {
          users[p].symbol = 'O';
        }
      }
      
      //set this room's GameState
      roomsGameState[`room ${roomNumber}`] = new GameState(players);

      io.to(`${firstToPlay}`).emit('first to play', 'You play first!');
      //reset players object and increase room number for next room
      players = {};
      roomNumber++;
    }
  }

  /////// PLAY EVENT ////////
  socket.on('play turn', cellId => {
    if (roomsGameState.hasOwnProperty(users[socket.id].room)) {
      if (!roomsGameState[users[socket.id].room].play(socket.id, cellId).error.exists) {
        //if it's a valid turn -> play
        socket.emit('valid turn', users[socket.id].symbol);
        socket.broadcast.to(users[socket.id].room).emit('play turn', {
          cellId,
          activeTurn: true,
          symbol: users[socket.id].symbol
        });
        if (roomsGameState[users[socket.id].room].getResult()) {
          io.in(users[socket.id].room).emit('endgame');
        }
      } else {
        //if it's an invalid turn -> error
        socket.emit('play turn', {
          activeTurn: false,
          errorMsg: roomsGameState[users[socket.id].room].play(socket.id, cellId).error.message
        });
      }
    }
  });

  //RESET GAME
  socket.on('reset game', () => {
    roomsGameState[users[socket.id].room].reset();
    if (roomsGameState[users[socket.id].room].getActiveTurn() === socket.id) {
      socket.emit('first to play', 'You play first!');
    }
  });

  //SET USERNAME
  socket.on('set username', data => {
    //can't set an empty username nor one with more than 10 chars
    if (data === '') return;
    if (data.length > 10) return;

    //set username for this client
    users[socket.id].username = data;

    if (Object.keys(io.sockets.adapter.rooms[users[socket.id].room].sockets).length === 2) {
      let usernames = [];
      let flag = true;
      //for every user connected to the room
      for (user in io.sockets.adapter.rooms[users[socket.id].room].sockets) {
        if (users[user].username === '') {
          //user hasn't set their username -> set flag to false and break
          flag = false;
          break;
        }
        usernames.push(users[user].username);
      }
      if (flag) {
        //both usernames are set -> send successful reply with usernames
        io.in(`${users[socket.id].room}`).emit('set username', {
          success: true,
          usernames,
          room: users[socket.id].room
        });
      } else {
        //only one user in the room has set their username
        socket.emit('set username', {
          success: false,
          message: 'Waiting for the other player to ready up.'
        });
      }
    } else {
      //user set username but has to wait for another user to join room
      socket.emit('set username', {
        success: false,
        message: 'Waiting for another player to join...'
      });
    }
  });


  //////// CHAT EVENTS ///////////
  socket.on('chat message', message => {
    //emits chat message data to all clients but the sender
    socket.to(users[socket.id].room).emit('chat message', message);
  });

  /////////// EVENT FOR USER DISCONNECTED /////////
  socket.on('disconnect', () => {
    socket.broadcast.to(users[socket.id].room).emit('user disconnect', 'Opponent disconnected');

    //players = {};

    //delete room's GameState
    delete roomsGameState[users[socket.id].room];
    //delete user
    delete users[socket.id];
  });
});

http.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});