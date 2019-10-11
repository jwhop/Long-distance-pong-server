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
			
		}
		else{
			for(var playerID in players){
				if(playerID == data.player_id){
					console.log("returning player!");
					console.log(data.player_id);
					player = players[data.player_id];
					console.log(players[data.player_id].current_games);
					
					
					thisPlayerID = data.player_id;
					
					game = games[players[thisPlayerID].current_games[0].id];
					
					thisGameID = games[players[thisPlayerID].current_games[0].id].id;
					
					
					
					if(games[thisGameID].player_left_id == thisPlayerID){
					
						socket.emit('continue_left', {test: 'wahoo!'});
					}
					else if (games[thisGameID].player_right_id == thisPlayerID){
						
						socket.emit('continue_right', {test: 'wahoo!'});
					}
					
					
					
					
				}
			}
			
			
		}
	});
	
	socket.on('ready_host', function(data) {
		console.log('received ready host');
		game = new Game();
		console.log('made new game');
		thisGameID = game.id;
		games[thisGameID] = game;
		game.player_left_id = thisPlayerID;
		game.player_left_location_lat = data.player_left_location_lat;
		game.player_left_location_long = data.player_left_location_long;
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
			
			if(String(gameID) == String(game_data.id) && games[gameID].joinable == true){
				console.log('success!!');
				
				found = true;
				game = games[game_data.id];
				thisGameID = game_data.id;
				game.player_right_id = thisPlayerID;
				game.player_right_location_lat = game_data.player_right_location_lat;
				game.player_right_location_long = game_data.player_right_location_long;
				game.remaining_distance_km = calculate_distance(game);
				game.remaining_distance_miles = game.remaining_distance_km * 0.621371;
				games[gameID].joinable = false;
				players[thisPlayerID].current_games.push(game);
				//p1 socket
				console.log(games[gameID]);
				games[thisGameID].remaining_time = Math.round((games[thisGameID].remaining_distance_km / 0.0000025));
				games[thisGameID].total_time = Math.round((games[thisGameID].remaining_distance_km / 0.0000025));
				sockets[games[gameID].player_left_id].emit('start_game_left', {total_time: games[thisGameID].total_time});
				//p2 socket
				sockets[thisPlayerID].emit('start_game_right', {total_time: games[thisGameID].total_time});
			}
		}
	if (found == false){
		console.log('join failed!');
		socket.emit('join_failed');
	};

	});
	
	socket.on('sent_ball_right', function(data) {
		//start timer, save ball info, emit to both players 

		//games[thisGameID].remaining_time = Math.round((games[thisGameID].remaining_distance_km / 0.000005));
		//games[thisGameID].total_time = Math.round((games[thisGameID].remaining_distance_km / 0.000005));
		//console.log(games[thisGameID].total_time);
		//sockets[thisPlayerID].emit('timer_update', {total_time: games[thisGameID].total_time});
		sockets[games[thisGameID].player_right_id].emit('start_timer',{total_time: games[thisGameID].total_time});
		
	});
	
	socket.on('sent_ball_left', function(data) {
		//start timer, save ball info, emit to both players 

		//games[thisGameID].remaining_time = Math.round((games[thisGameID].remaining_distance_km / 0.000005));
		//games[thisGameID].total_time = Math.round((games[thisGameID].remaining_distance_km / 0.000005));
		//console.log(games[thisGameID].total_time);
		//sockets[thisPlayerID].emit('timer_update', {total_time: games[thisGameID].total_time});
		sockets[games[thisGameID].player_left_id].emit('start_timer',{total_time: games[thisGameID].total_time});
		
	});
	
	socket.on('disconnect', function() {
		console.log('a player has disconnected');
		//delete players[thisPlayerID];
		//delete sockets[thisPlayerID];
		
		//socket.broadcast.emit('disconnected', player);
	});
	
});

function calculate_distance(game)
{
	var lon2 = game.player_right_location_long;
	var lon1 = game.player_left_location_long;
	var lat2 = game.player_right_location_lat;
	var lat1 = game.player_left_location_lat;
	dlon = lon2 - lon1;
	dlat = lat2 - lat1;
	var a = Math.pow((Math.sin(dlat/2)* Math.PI / 180),2) + Math.cos(lat1* Math.PI / 180) * Math.cos(lat2* Math.PI / 180) * Math.pow((Math.sin(dlon/2)* Math.PI / 180),2);
	var c = 2* Math.atan2( Math.sqrt(a), Math.sqrt(1-a));
	d = 6373 * c;
	console.log(d);
	return d.toFixed(1);
}
