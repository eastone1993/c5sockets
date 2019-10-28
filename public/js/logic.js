module.exports = {

	changeTurn: function(turnObj) {
		if (turnObj.turn == 'X') {
			return turnObj.turn = 'O'; 
		}
		else if (turnObj.turn == 'O') {
			return turnObj.turn = 'X'; 
		}
		else {
			throw("Error: Turn Undefined"); 
		}
	},

	checkForWin: function(boardArray, i, j) {		 
		if (module.exports.lateralCheck(boardArray, i, j) == true || module.exports.verticalCheck(boardArray, i, j) == true || module.exports.uLLRCheck(boardArray, i, j) == true || module.exports.lLURCheck(boardArray, i, j) == true) {
			return 'win';
		}
		else {
			return module.exports.drawCheck(boardArray);	
		}
	},

	lateralCheck: function(boardArray, i, j) {
		var winCount = 1;
		var iter = 1; 
		while (j >= 0 && j+iter <= 9) {
			if (boardArray[i][j+iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}
			}
			else {
				break
			}
		}

		iter = 1; 

		while (j <= 9 && j-iter >= 0) {
			if (boardArray[i][j-iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}			
			}
			else {
				break
			}
		}	
		return false;
	},

	verticalCheck: function(boardArray, i, j) {
		var winCount = 1;
		var iter = 1; 
		while (i >= 0 && i+iter <= 9) {
			if (boardArray[i+iter][j] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}
			}
			else {
				break
			}
		}

		iter = 1; 

		while (i <= 9 && i-iter >= 0) {
			if (boardArray[i-iter][j] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}			
			}
			else {
				break
			}
		}	
		return false; 	
	},

	uLLRCheck: function(boardArray, i, j) {
		var winCount = 1;
		var iter = 1; 
		while (i >= 0 && i+iter <= 9 && j >= 0 && j+iter <= 9) {
			if (boardArray[i+iter][j+iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}
			}
			else {
				break
			}
		}

		iter = 1; 

		while (i <= 9 && i-iter >= 0 && j <= 9 && j-iter >= 0) {
			if (boardArray[i-iter][j-iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}			
			}
			else {
				break
			}
		}	
		return false;	
	},

	lLURCheck: function(boardArray, i, j) {
		var winCount = 1;
		var iter = 1; 
		while (i >= 0 && i+iter <= 9 && j-iter >= 0 && j <= 9) {
			if (boardArray[i+iter][j-iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}
			}
			else {
				break
			}
		}

		iter = 1; 

		while (i <= 9 && i-iter >= 0 && j+iter <= 9 && j >= 0) {
			if (boardArray[i-iter][j+iter] == boardArray[i][j]) {
				winCount += 1;
				iter += 1;
				if (winCount == 5) {
					return true; 
				}			
			}
			else {
				break
			}
		}	
		return false;
	},

	drawCheck: function(boardArray) {
		var emptySpaces = 0;
		for (var u = 0; u < boardArray.length; u++) {
			for (var v = 0; v < boardArray.length; v++) {
				if(boardArray[u][v] == '') {
					emptySpaces += 1;
				}
			}
		}
		if (emptySpaces == 0) {
			return 'draw';
		}
		else {
			return 'continue';
		}
	}
}