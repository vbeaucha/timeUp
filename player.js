class Player {
	
	let playerName;

	Player(name){
		this.playerName = name;
	}

	function setPlayerName(name){
		this.playerName = name;
	}

	function getName(){
		return playerName;
	}
}

module.exports.Player = Player