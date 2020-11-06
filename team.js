module.exports  = class Team{

	playerList;
	teamPoint;

	constructor(){
		this.playerList = new Array();
		this.teamPoint = 0;
	}

	getPoint(){
		return this.teamPoint;
	}

	getPlayer(){
		return this.playerList;
	}

	addPoint(){
		this.teamPoint++;
	}

	removePoint(){
		this.teamPoint--;
	}

	addPlayer(player){
		this.playerList.push(player);
	}

	removePlayer(player){
		let index = this.playerList.indexOf(player);
		if(index != -1 ){
			this.playerList.splice(index, 1);
		}
	}


}

