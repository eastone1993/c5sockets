module.exports = { //

	generateBoard: function() { //generaes an empty board state
		var boardArray = []; 
		for (var i = 0; i < 10; i++) {
			boardArray[i] = [];  
			for (var j = 0; j < 10; j++) {
				//boardArray[i].push(`${i}` + `${j}`);  //this is used for debugging
				boardArray[i].push('');  //this is used for prod
			}
		}
		return boardArray;
	},

	buildRooms: function(roomObj) { //generates an empty RoomObj - *****SHOULD ONLY BE USED ON SERVER INITILIZATION******
		for (var key in roomObj) {
	        if (roomObj.hasOwnProperty(key)) {
	            roomObj[key] = { //this is the game obj that holds info about the game
	                turn: 'X', 
	                boardArray: module.exports.generateBoard(), 
	                gameStatus: 'new', 
	                players: {
	                	number: 0,
	                    X: {
	                        username: '', //username is not yet an implemented value
	                        id: '',
	                        type: 'X'
	                    },
	                    O: {
	                        username: '',
	                        id: '',
	                        type: 'O'
	                    }
	                }
	            }    
	        }
	    }
	    return roomObj;
	},

	resetRoom: function(gameObj) { //still working on Reset Room function
		//reset turn
		gameObj.turn = 'X'; 

		//reset board array
		gameObj.boardArray = module.exports.generateBoard(); 
		
		//switch player pieces
		var tmpX = gameObj.players[gameObj.players.X.id]; 
		var tmpO = gameObj.players[gameObj.players.O.id];
		gameObj.players[gameObj.players.X.id] = tmpO; 
		gameObj.players[gameObj.players.O.id] = tmpX; 
		
		//reset game status - currently not an implemented value
		gameObj.gameStatus = 'new';
		
		return gameObj; 
	}
}