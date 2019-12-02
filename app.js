var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
var userArray = [];
var roomObj = {
    '1001': '',
    '1002': '',
    '1003': ''
}


//populates rooms with information
setup.buildRooms(roomObj); 

/* GET home page. */

app.get('/', function(req, res) {
    var hasUsername; 
    if (req.cookies['username']) {
        if (userArray.includes(req.cookies['username']) === false) {
            userArray.push(req.cookies['username']);
        } 
        hasUsername = true;
    } else {
        hasUsername = false;
    }
    res.render('index', {
        title: 'Connect 5', 
        roomObj: roomObj,
        hasUsername: hasUsername
    });
});

app.post('/user', function(req, res) {
    var username = req.body.username;
    console.log('Username: ' + username);
    if (userArray.includes(username)) {
        res.send("taken"); 
    } else {
        userArray.push(username); 
        res.cookie("username", username);
        console.log(req.cookies);
        res.send("cookie updated");
    }
    console.log(userArray);
}); 

// app.get('/checkuser', function(req, res) {
//     console.log(req.cookies['username']); 
//     res.send(req.cookies);
// });

app.get('/fetchRoom', function(req, res) {
    console.log(`Room Checked: ${req.query.room}`);
    res.send(roomObj[req.query.room]);
});

app.get('/room', function(req, res) {
    if(!req.query.location) {
        console.log('ITS RAINING SIDEWAYS'); 
        res.send('<p>theres something fishy going on</>')
    } else {
        console.log(`Query: ${req.query.location}`);
        var location = req.query.location;
        var username = req.cookies['username'];
        if(roomObj[location].players.X.id == '' || roomObj[location].players.O.id == '' || username == roomObj[location].players.X.username || username == roomObj[location].players.O.username) {
            res.render('room', { 
                title: 'Connect 5', 
                roomObj: roomObj,
                username: username,
                roomLocation: location,
                boardArray: roomObj[location].boardArray, 
                turn: roomObj[location].turn
            });
            //console.log(roomObj[location]);
        } else {
            console.log('room full')
            console.log(roomObj);
            res.send('<p>ROOMFULL</p>');
        }
    }     
});
 
io.on('connection', function(socket) { //code for the socket io connection 

    //code that runs on initial connection
    console.log('a user connected: ' + socket.id);
    socket.on('join', function(res) {
        var username = res.username;
        var location = res.location;    
        socket.join(location, function() {
            if (roomObj[location].players.X.username == username) {
                roomObj[location].players.X.id = socket.id;
                roomObj[location].players[socket.id] = 'X';
                roomObj[location].players.number += 1;  

            } else if(roomObj[location].players.O.username == username) {
                roomObj[location].players.O.id = socket.id;
                roomObj[location].players[socket.id] = 'O';
                roomObj[location].players.number += 1; 

            } else if(roomObj[location].players.X.id == '') {
                roomObj[location].players.X.id = socket.id;
                roomObj[location].players[socket.id] = 'X';
                roomObj[location].players.number += 1;  
                if (username != roomObj[location].players.X.username) {
                    roomObj[location].players.X.username = username; 
                }
            } else if(roomObj[location].players.O.id == '') {
                roomObj[location].players.O.id = socket.id;
                roomObj[location].players[socket.id] = 'O';
                roomObj[location].players.number += 1; 
                if (username != roomObj[location].players.O.username) {
                    roomObj[location].players.O.username = username; 
                }
            } else {
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
        var playerPiece = roomObj[location].players[socket.id]
        socket.on('disconnect', function() {
            setTimeout(function() {
                if (roomObj[location].players[playerPiece].id == '') {
                    console.log('user disconnected: ' + socket.id);
                    roomObj[location].players[playerPiece].username = ''; 
                }       
            }, 10000);
            if (roomObj[location].players[roomObj[location].players[socket.id]].id == socket.id) {
                roomObj[location].players[roomObj[location].players[socket.id]].id = '';
            } 
            delete roomObj[location].players[socket.id];
            roomObj[location].players.number -= 1; 
        });
        //console.log(roomObj[location]);
    });
 
    socket.on('move', function(move) { //whenever a player makes a move
        var location = Object.keys(io.sockets.adapter.sids[socket.id])[0];
        //console.log(location);
        // console.log(move);
        console.log(roomObj[location]);
        if (roomObj[location].boardArray[move[0]][move[1]] == '' && socket.id == roomObj[location].players[roomObj[location].turn].id) {
            roomObj[location].boardArray[move[0]][move[1]] = roomObj[location].turn;
            roomObj[location].gameStatus = logic.checkForWin(roomObj[location].boardArray, parseInt(move[0], 10), parseInt(move[1], 10));
            if (roomObj[location].gameStatus == 'win') {
                console.log('win');
                io.to(location).emit('win', {
                    gameObj: roomObj[location], 
                    lastMove: move
                });
                setTimeout(function() {
                    setup.resetRoom(roomObj[location]);
                    console.log(roomObj[location]); 
                    io.to(location).emit('reset');                    
                }, 3000); 
            } else if (roomObj[location].gameStatus == 'draw') {
                console.log('draw');
                io.to(location).emit('draw', {
                    gameObj: roomObj[location], 
                    lastMove: move
                });
                setTimeout(function() {
                    setup.resetRoom(roomObj[location]);
                    console.log(roomObj[location]); 
                    io.to(location).emit('reset');                    
                }, 3000); 
            } else {
                var lastTurn = roomObj[location].turn
                logic.changeTurn(roomObj[location]);
                io.to(location).emit('move', {
                    gameObj: roomObj[location], 
                    lastMove: move, 
                    lastTurn: lastTurn
                });
            }
        } else {
            console.log('invalid move');
        }
    });

    socket.on('reset', function(res) {
        var location = Object.keys(io.sockets.adapter.sids[socket.id])[0];
        setup.resetRoom(roomObj[location]);
        console.log(roomObj[location]); 
        io.to(location).emit('reset');
    });
});

