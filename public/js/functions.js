function drawGameBoard() {
    for (let i = 0; i < 3; i++) {
        $('#board').append('<div class="row board-row justify-content-center"></div>')
    }
    for (let i = 0; i < 3; i++) {
        $('.board-row').append('<div class="col-4 cell"></div>');
    }
    $('.cell').each((i, e) => $(e).append(`<span id="${i}"></span>`));
}

$(function () {
    const socket = io();

    /***** PLAYER DETAILS (LEFT/UPPER PANEL) ******/
    $('#username-form').click(() => {
        //validate username length
        if ($('#username-input').val().length < 1 || $('#username-input').val().length > 10) {
            $('#username-label').text('Must be between 1 and 10 characters')
        } else {
            //if valid, emit 'set username' event to perform server side validation
            // and register the username
            socket.emit('set username', $('#username-input').val());
            //console.log($('#username-input').val())
            $('#username-input').val('');
        }
    });

    /******* SET USERNAME EVENT *********/
    socket.on('set username', data => {
        //hide username form
        $('.username').hide();
        //evaluate if the event 'set username' responds with successful data or not
        if (!data.success) {
            //in case of unsuccessful response -> show alert with message
            $('.user-alert').text(data.message);
            $('.user-alert').css('display', 'block');
        } else {
            //in case of successful responde -> hide alert (if shown) and set players-info data and display
            $('.user-alert').hide();
            $('.card-header').text(data.usernames[0] + ' vs ' + data.usernames[1]);
            $('.card-body').children('#room').text(data.room);
            $('.card-body').children('#score').text('Score');
            $('.players-info').css('display', 'block');
            //allow clicking the board after usernames are set
            $('#board').css('pointer-events', 'all');
        }
    });

    /******* PLAY EVENT *********/
    let cellClicked = null;
    $('.cell').click(function () {
        //emit play event when clicking a cell
        socket.emit('play turn', $(this).children('span').attr('id'));
        cellClicked = $(this).children('span');
    });

    //event recived by the client that just played
    //if it was a valid turn, it sets the symbol
    socket.on('valid turn', (symbol) => {
        cellClicked.text(symbol);
        $('.gameplay-alert').hide();
    });

    //event recived when the other player plays
    socket.on('play turn', (data) => {
        if (!data.activeTurn) {
            console.log(data.errorMsg)
            $('.gameplay-alert').text(data.errorMsg);
            $('.gameplay-alert').css('display', 'block')
        } else if (data.activeTurn) {
            console.log('valid turn html')
            $('.gameplay-alert').hide();
            $(`#${data.cellId}`).text(data.symbol);
        }
    });

    socket.on('first to play', (msg) => {
        console.log(msg)
    });

    /******** CHAT EVENT ********/
    $('#chat-form').submit(function (e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#messages').append($('<li>').text('Me: ' + $('#m').val()));
        $('#m').val('');
        return false;
    });

    socket.on('chat message', (data) => {
        $('#messages').append($('<li>').text('Noob: ' + data));
    });

    /******** DISCONNECT EVENT********/
    socket.on('user disconnect', (data) => {
        console.log(data)
        $('#messages').append($('<li>').text(data));
    });
});
