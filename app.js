var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require('http').createServer(app); 
var io = require('socket.io')(http);
var port = 3000;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); 
//app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', routes);
app.use('/users', users);

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//SET UP SERVER///////////////////////////////////
http.listen(port, function() {
    console.log('listening on :' + port);
});
///////////////////////////////////////////////////


//////API//////////////
const setup = require('./public/js/setup.js');
const logic = require('./public/js/logic.js'); 
var gameObj = {

    turn: 'X', 
    boardArray: setup.generateBoard(), 
    gameStatus: 'new', 
    players: {
        X: {
            username: '',
            id: '',
            type: 'X'
        },
        O: {
            username: '',
            id: '',
            type: 'O'
        }
    }
};  

/* GET home page. */
app.get('/', function(req, res) {
    if(gameObj.players.X.id == '' || gameObj.players.O.id == '') {
        res.render('index', { title: 'Connect 5', boardArray: gameObj.boardArray, turn: gameObj.turn});
        console.log(gameObj);
    }
    else {
        console.log('room full')
        res.send('<p>ROOMFULL</p>');
    }
});

io.on('connection', function(socket) {
    console.log('a user connected: ' + socket.id);

    if (gameObj.players.X.id == '') {
        gameObj.players.X.id = socket.id;
        gameObj.players[socket.id] = 'X'; 
    }
    else if(gameObj.players.O.id == '') {
        gameObj.players.O.id = socket.id;
        gameObj.players[socket.id] = 'O'; 
    }
    else {
        console.log('This is weird!');
    }
    console.log(gameObj);

    socket.on('disconnect', function() {
        console.log('user disconnected: ' + socket.id);
        gameObj.players[gameObj.players[socket.id]].id = ''; 
        delete gameObj.players[socket.id];
        console.log(gameObj);
    });
    socket.on('move', function(move) {
        console.log(move);
        if (gameObj.boardArray[move[0]][move[1]] == '' && socket.id == gameObj.players[gameObj.turn].id) {
            gameObj.boardArray[move[0]][move[1]] = gameObj.turn;
            gameObj.gameStatus = logic.checkForWin(gameObj.boardArray, parseInt(move[0], 10), parseInt(move[1], 10));
            if (gameObj.gameStatus == 'win') {
                console.log('win');
                io.emit('win', {gameObj: gameObj, lastMove: move});
            }
            else if (gameObj.gameStatus == 'draw') {
                console.log('draw');
                io.emit('draw', {gameObj: gameObj, lastMove: move}); 
            }
            else {
                var lastTurn = gameObj.turn
                logic.changeTurn(gameObj);
                io.emit('move', {gameObj: gameObj, lastMove: move, lastTurn: lastTurn})
            }
        }
        else {
            console.log('invalid move');
        }
    });
});

app.post('/reset', function(req, res) {
    console.log('resetting game');
    gameObj.turn = 'X'; 
    gameObj.boardArray = setup.generateBoard(); 
    gameObj.gameStatus = 'new';
    res.send('game reset');  
});
