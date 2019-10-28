module.exports = {

	generateBoard: function() {
		var boardArray = []; 
		for (var i = 0; i < 10; i++) {
			boardArray[i] = [];  
			for (var j = 0; j < 10; j++) {
				//boardArray[i].push(`${i}` + `${j}`);  
				boardArray[i].push('');  
			}
		}
		return boardArray 
	}
}