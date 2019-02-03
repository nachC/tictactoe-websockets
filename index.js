const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let roomNumber = 0;
let roomsById = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  //USER CONNECTS
  console.log('a user connected');
  if (io.sockets.adapter.rooms[`room ${roomNumber}`] === undefined 
      || io.sockets.adapter.rooms[`room ${roomNumber}`].length <= 1) {
    socket.join(`room ${roomNumber}`);
    roomsById[socket.id] = `room ${roomNumber}`;
    console.log(`user joined room ${roomNumber}`)
  }else{
    roomNumber++;
    socket.join(`room ${roomNumber}`);
    roomsById[socket.id] = `room ${roomNumber}`;
    console.log(`send user to room ${roomNumber}`);
  }

  //PLAY EVENT
  socket.on('play turn', (cellId) => {
    //need to record last active player
    //need to save game state
    socket.broadcast.to(roomsById[socket.id]).emit('play turn', cellId);
  });

  //EVENT FOR USER DISCONNECTED
  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});