var express = require('express');
var router = express.Router();
const app = require('../app.js');


const setup = require('../public/js/setup.js');
var boardArray = setup.generateBoard();

const logic = require('../public/js/logic.js'); 
var gameObj = {turn: 'X'};  

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Connect 5', boardArray: boardArray, turn: gameObj.turn});
});

/* POST new move. */

router.post('/move', function(req, res) {
	if (boardArray[req.body.blockID[0]][req.body.blockID[1]] == '') {
		boardArray[req.body.blockID[0]][req.body.blockID[1]] = gameObj.turn;
		var gameStatus = logic.checkForWin(boardArray, parseInt(req.body.blockID[0],10), parseInt(req.body.blockID[1], 10));  
		if (gameStatus == 'win') {
			res.send({boardArray: boardArray, turn: gameObj.turn, status: gameStatus});
			boardArray = setup.generateBoard(); 
			gameObj = {turn: 'X'}; 		
		}
		else {
			res.send({boardArray: boardArray, turn: gameObj.turn, status: gameStatus}); 
			logic.changeTurn(gameObj);	
		} 
		
	}
	else {
		res.send({status: 'invalid move'})
	}
});

router.post('/reset', function(req, res) {
	console.log('resetting game');
	boardArray = setup.generateBoard(); 
	gameObj = {turn: 'X'};
	res.send('game reset');  
});

module.exports = router;
  