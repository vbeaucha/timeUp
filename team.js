let Player = require("./player.js");

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

	getPlayers(){
		return this.playerList;
	}

	getPlayer(player){
		let index = this.playerList.indexOf(player);
		if(index != -1 ){
			return this.playerList[i]
		}else{
			return 0;
		}
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

