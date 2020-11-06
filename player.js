class Player {
	
	playerName;

	Player(name){
		this.playerName = name;
	}

	setPlayerName(name){
		this.playerName = name;
	}

	getName(){
		return playerName;
	}
}

module.exports.Player = Player