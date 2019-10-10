var io = require('socket.io')(process.env.PORT || 52300);

var Player = require('./player.js');
var Game = require('./game.js');

console.log('server is started!');

var players = [];
var sockets = [];
var games = [];
io.on('connection', function(socket){
	
	console.log('made connection!');
	
	socket.emit('start_register');
	var player;
	var thisPlayerID;
	var game;
	var thisGameID;
	
	socket.on('registering', function(data) {
		console.log(data);
		if (data.player_id == '0'){
			console.log("new player!");
			player = new Player();
			thisPlayerID = player.id;
	
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
			player = players[data.player_id]
			thisPlayerID = data.player_id;
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
	
	socket.on('ready_host', function(data) {
		console.log('received ready host');
		game = new Game();
		console.log('made new game');
		thisGameID = game.id;
		games[thisGameID] = game;
		players[thisPlayerID].current_games.push(game);
		console.log('game id is ' + game.id);
		socket.emit('done_ready_host', {id: game.id});
		
		
	});
	
	socket.on('ready_join', function(game_data){
		console.log(game_data);
		//search games for game with proper id
		//if found, make sure it is joinable
		//if so, make it not joinable and emit start game for socket of p1 and socket of p2
		//if not, emit just for p2 that it is not joinable
		var found = false;
		for (var gameID in games){
			console.log('the one that is stored is ' + gameID);
			console.log('the one we got from unity is ' + game_data.id);
			console.log(games[gameID].joinable);
			if(String(gameID) == String(game_data.id) && games[gameID].joinable == true){
				console.log('success!!');
				found = true;
				game = games[game_data.id];
				thisGameID = game_data.id;
				gamed[gameID].joinable = false;
				players[thisPlayerID].current_games.push(game);
				//p1 socket
				sockets[gamed[gameID].player_left_id].emit('start_game');
				//p2 socket
				sockets[thisPlayerID].emit('start_game');
			}
		}
	if (found == false){
		console.log('join failed!');
		socket.emit('join_failed');
	};

	});
	
	socket.on('disconnect', function() {
		console.log('a player has disconnected');
		delete players[thisPlayerID];
		delete sockets[thisPlayerID];
		
		//socket.broadcast.emit('disconnected', player);
	});
	
});