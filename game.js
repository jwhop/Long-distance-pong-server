var shortid = require('shortid');

module.exports = class Game{
		constructor(){
				this.id = shortid.generate();
				this.player_left_name = '';
				this.player_right_name = '';
				this.player_left_id = '';
				this.player_right_id = '';
				this.player_left_location_lat = '';
				this.player_left_location_long = '';
				this.player_right_location_lat = '';
				this.player_right_location_long = '';
				this.score_left = 0;
				this.score_right = 0;
				this.remaining_time = -1;
				this.remaining_distance_miles = -1;
				this.remaining_distance_km = -1;
				this.joinable = true;

		}
		
	
	
}