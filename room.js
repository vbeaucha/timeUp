let Team = require("./team.js");

module.exports = class room{
	
	teamList;
	game;

	constructor(){
		this.teamList = new Map();
		this.game = "TimeUp"
	}

	getTeam(){
		return this.teamList;
	}

	getGame(){
		return this.game;
	}
	createTeam(name){
		this.teamList.set(name,new Team());
	}

	removeTeam(name){
		this.teamList.delete(name)
	}

	addPlayerToTeam(name,player){
		this.teamList.get(name).addPlayer(player);
	}

	removePlayerToTeam(name,player){
		this.teamList.get(name).removePlayer(player);
	}

	addPointToTeam(name){
		this.teamList.get(name).addPoint();
	}

	removePointToTeam(name){
		this.teamList.get(name).removePoint();
	}

	getPointOfTeam(name){
		return this.teamList.get(name).getPoint();
	}

	getPlayerListOfTeam(name){
		return this.teamList.get(name).getPlayer();
	}
}