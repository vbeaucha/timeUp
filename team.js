class Team{

	let playerList = new Map();
	let teamPoint;

	Team(){
		this.playerList = new Map();
		this.teamPoint = 0;
	}

	function getPoint(){
		return this.teamPoint;
	}

	function getPlayer(){
		return this.playerList;
	}

	function addPoint(){
		this.teamPoint++;
	}

	function removePoint(){
		this.teamPoint--;
	}

	function addPlayer(Player player){
		this.playerList.push(player);
	}

	function removePlayer(player){
		this.playerList.delete(player);
	}


}

module.exports.Team = Team;