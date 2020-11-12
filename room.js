let Team = require("./team.js");

module.exports = class room{
	
	teamList;
	playerList;
	name;
	game;
	roomEtat="";
	teamTurn = '';

	constructor(name,gameName){
		this.playerList = new Array();
		this.teamList = new Map();
		this.game = gameName;
		this.name = name
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
	removePlayer(player){
		let index = this.playerList.indexOf(player);
		if(index != -1 ){
			this.playerList.splice(index, 1);
		}
	}
	addPlayer(player){
		this.playerList.push(player);
	}

	getTeam(){
		return this.teamList;
	}

	getGame(){
		return this.game;
	}
	createTeam(name){
		if(this.teamList.get(name) == undefined)
			return this.teamList.set(name,new Team());
		else return 0;
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

	getEtat(){
		return this.roomEtat;
	}
	setEtat(etat){
		this.roomEtat = etat;
	}

	setUserSocket(username,socket){
		let user = this.UserList.get(username);
		if(user){
			user.socket = socket;
			user.socket.room = this;
			user.socket.username = username;
			socket.on('startGame',function(){
				this.room.game.startGame();
				//this.game.startGame();
			});
			this.game.setSocketEvent(socket);
			this.sendlistPlayerToAllPlayer();
		}else{
			return 0;
		}
}