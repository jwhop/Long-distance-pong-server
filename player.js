var shortid = require('shortid');

module.exports = class Player{
		constructor(){
				this.username = '';
				this.id = shortid.generate();
				this.current_games = [];
		}
		
	
	
}