var io = require('socket.io')(process.env.PORT || 52300);

var Player = require('./player.js');

console.log('server is started!');

var players = [];
var sockets = [];

io.on('connection', function(socket){
	
	console.log('made connection!');
	
	socket.emit('start_register');
	
	socket.on('registering', function(data) {
		console.log(data);
		if (data.player_id == '0'){
			console.log("new player!");
			var player = new Player();
			var thisPlayerID = player.id;
	
			players[thisPlayerID] = player;
			sockets[thisPlayerID] = socket;
	
			//tell the client that this is our id for the server
			socket.emit('register', {id: thisPlayerID});
			/*
			socket.emit('spawn', player); //tell myself that i have spawned
			socket.broadcast.emit('spawn', player); //tell others i have spawned
			//tell myself about everyone else in the game
			for(var playerID in players){
				if(playerID != thisPlayerID){
					socket.emit('spawn', players[playerID]);
				}
			}*/
		}
		else{
			console.log("returning player!");
			var player = players[data.player_id]
			var thisPlayerID = data.player_id;
			socket.emit('register', {id: thisPlayerID});
			/*
			socket.emit('spawn', player); //tell myself that i have spawned
			socket.broadcast.emit('spawn', player); //tell others i have spawned
			//tell myself about everyone else in the game
			for(var playerID in players){
				if(playerID != thisPlayerID){
					socket.emit('spawn', players[playerID]);
				}
			}*/
		}
	});
	
	
	
	socket.on('disconnect', function() {
		console.log('a player has disconnected');
		//delete players[thisPlayerID];
		//delete sockets[thisPlayerID];
		//socket.broadcast.emit('disconnected', player);
	});
	
});