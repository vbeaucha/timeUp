let TimeUp = require('./timeUp.js')
class Room {

	UserList = new Map();
	userTurn = '';
	game = '';
	gameName=";"
	roomEtat="";


	constructor(gameName){
		this.roomEtat='settingRoom';
		this.gameName=gameName;
		if(gameName == 'timeUp'){
			this.game = new TimeUp();

			this.game.setRoom(this)
		}
		
		
	}

	getUserList(){
		return this.UserList;
	}

	getUserByName(name){
		let user = null;
		this.UserList.forEach((values,key)=>{
			if(name == key){
				user =  values;
			}
		});
		return user;
	}

	addUser(username){
		this.UserList.set(username,{userTurn:false,point:0,socket:null});
	}

	logoutUser(username){
		this.UserList.delete(username);

		this.sendlistPlayerToAllPlayer();
		
		if(this.UserList.size == 0){
			return 0
		}else{
			if(this.game.getNamePlayer() == username) this.game.next();
			return 1
		}
	}

	setGame(name){
		this.gameName=name;
		if(name == 'timeUp'){
			this.game = new TimeUp();
			this.game.setRoom(this)
		}
	}

	getGameName(){
		return this.gameName;
	}

	getGame(){
		return this.game;
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

	getEtat(){
		return this.roomEtat;
	}
	setEtat(etat){
		this.roomEtat = etat;
	}

	sendlistPlayerToAllPlayer(){
		let userInfo = new Array();
		this.UserList.forEach((values,key)=>{
			userInfo.push({name:key,status:values.socket!=null})
		});
		this.UserList.forEach((values,key)=>{
			if(values.socket){
				values.socket.emit("listPlayer",userInfo);
			}
		});
	}
}

module.exports = Room;