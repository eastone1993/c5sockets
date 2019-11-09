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
var roomObj = {
    '1001': '',
    '1002': '',
    '1003': ''
}

//populates rooms with information
setup.buildRooms(roomObj); 

/* GET home page. */

app.get('/', function(req, res) {
    res.render('index', {
        title: 'Connect 5', 
        roomObj: roomObj
    });
});

app.get('/checkRoom', function(req, res) {
    console.log(`Room Checked: ${req.query.room}`);
    res.send(roomObj);
});

app.get('/room', function(req, res) {
    console.log(`Query: ${req.query.location}`);
    var location = req.query.location;
    if(roomObj[location].players.X.id == '' || roomObj[location].players.O.id == '') {
        res.render('room', { 
            title: 'Connect 5', 
            roomObj: roomObj,
            roomLocation: location,
            boardArray: roomObj[location].boardArray, 
            turn: roomObj[location].turn
        });
        console.log(roomObj[location]);
    }  
    else {
        console.log('room full')
        console.log(roomObj);
        res.send('<p>ROOMFULL</p>');
    }   
});
/*

app.post('/reset', function(req, res) {
    console.log('resetting game');
    roomObj[req.body.location].turn = 'X'; 
    roomObj[req.body.location].boardArray = setup.generateBoard(); 
    roomObj[req.body.location].gameStatus = 'new';
    res.send('game reset');  
});
*/

io.on('connection', function(socket) { //code for the socket io connection 

    //code that runs on initial connection
    console.log('a user connected: ' + socket.id);
    socket.on('join', function(res) {
        var location = res.location; 
        socket.join(location, function() {
            if (roomObj[location].players.X.id == '') {
                roomObj[location].players.X.id = socket.id;
                roomObj[location].players[socket.id] = 'X'; 

            }
            else if(roomObj[location].players.O.id == '') {
                roomObj[location].players.O.id = socket.id;
                roomObj[location].players[socket.id] = 'O'; 
            }
            else {
                console.log('This is weird!');
            }
            //console.log(roomObj);
            io.to(socket.id).emit('join', { 
                gameObj: roomObj[location],
                id: socket.id
            });            
        });
    });  
    //end code that runs on connection

    socket.on('disconnecting', function() { //whenever a player disconnects
        
        var location = Object.keys(io.sockets.adapter.sids[socket.id])[0];
        
        socket.on('disconnect', function() {
            //console.log('This shit works!');
            //console.log(roomObj[location]);
            console.log('user disconnected: ' + socket.id);
            roomObj[location].players[roomObj[location].players[socket.id]].id = ''; 
            delete roomObj[location].players[socket.id];
        });
        //console.log(roomObj[location]);
    });

    socket.on('move', function(move) { //whenever a player makes a move
        var location = Object.keys(io.sockets.adapter.sids[socket.id])[0];
        console.log(location);
        console.log(move);
        console.log(roomObj);
        if (roomObj[location].boardArray[move[0]][move[1]] == '' && socket.id == roomObj[location].players[roomObj[location].turn].id) {
            roomObj[location].boardArray[move[0]][move[1]] = roomObj[location].turn;
            roomObj[location].gameStatus = logic.checkForWin(roomObj[location].boardArray, parseInt(move[0], 10), parseInt(move[1], 10));
            if (roomObj[location].gameStatus == 'win') {
                console.log('win');
                io.to(location).emit('win', {
                    gameObj: roomObj[location], 
                    lastMove: move
                });

            }
            else if (roomObj[location].gameStatus == 'draw') {
                console.log('draw');
                io.to(location).emit('draw', {
                    gameObj: roomObj[location], 
                    lastMove: move
                }); 
            }
            else {
                var lastTurn = roomObj[location].turn
                logic.changeTurn(roomObj[location]);
                io.to(location).emit('move', {
                    gameObj: roomObj[location], 
                    lastMove: move, 
                    lastTurn: lastTurn
                });
            }
        }
        else {
            console.log('invalid move');
        }
    });

    socket.on('test', function(res) {
        //socket.join('1002');
        var location = Object.keys(io.sockets.adapter.sids[socket.id])[0];
        setup.resetRoom(roomObj[location]);
        io.to(location).emit('reset');
    });
});

