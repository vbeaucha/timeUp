class TimeUp {

	namePlayer ="";
	phase="timeup/chooseWords";
	room ="";
	listMots = new Array();
	userIterator = null;
	gameStart=false;


	constructor(){

	}
	getNamePlayer(){
		return this.namePlayer;
	}
	setRoom(room){
		this.room = room;
	}

	startGame(){
		if(this.room){
			this.gameStart = true;
			this.room.setEtat(this.phase);
			let userList = this.room.getUserList();
			userList.forEach((values,key)=>{
				values.asChooseWord=false;
				if(values.socket){
					values.socket.emit('goTo',this.phase);
				} 
			});
		}
	}


	setSocketEvent(socket){

		socket.on("words", function(words){
			let user = this.room.getUserByName(this.username);
			if(!user.asChooseWord){
				user.asChooseWord = true;
				this.room.game.addMotToList(words);
			}
			
		});

		socket.on("passTour",function(){
			this.room.game.next();
		});

		socket.on("passWord",function(){
			this.room.game.passWord();
		});
		socket.on("findWord",function(word){
			this.room.game.wordFind(word);
		});

		socket.on("ready",function(){
			this.room.game.playPhase();
		});

		if(this.phase!="timeup/chooseWords" && this.phase!="timeup/score") this.setPhaseToSocket(socket);
		else if(this.phase=="timeup/score") this.sendScore(socket);
	}
	sendScore(socket){
		let scores = new Array();
		this.room.getUserList().forEach((values,key)=>{
			scores.push({name:key,point:values.point});
		});
		socket.emit("getScore",scores);
	}
	setPhaseToSocket(socket){
		let user = this.room.getUserByName(socket.username);
		socket.emit("notYourTurn");
		socket.emit("namePlayer",this.namePlayer)
	  	socket.emit("getPoint",user.point);

	  	if(socket.username == this.namePlayer)socket.emit("yourTurn"); 

	}

	addMotToList(words){

		for(let i = 0;i<words.length;i++){
			this.listMots.push(words[i]);
		}
		this.checkEveryBodyReady();
	}

	checkEveryBodyReady(){

		let everybodyReady = true;
		this.room.getUserList().forEach((values,key) =>{
			if(!values.asChooseWord)everybodyReady =false;
		});
		if(everybodyReady)this.nextPhase()
	}

	nextPhase(){

		if(this.phase =="timeup/chooseWords"){
			this.phase = 'timeup/phaseUn';
			this.room.setEtat(this.phase);
			let userList = this.room.getUserList();
				userList.forEach((values,key)=>{
					if(values.socket){
						values.socket.emit('goTo',this.phase);
					} 
				});

			this.startPhaseUn();
			//set phaseUn
		}else if(this.phase =="timeup/phaseUn"){
			this.phase = 'timeup/phaseDeux';
			this.room.setEtat(this.phase);
			let userList = this.room.getUserList();
				userList.forEach((values,key)=>{
					if(values.socket){
						values.socket.emit('goTo',this.phase);
					} 
				});

			this.startPhaseDeux();
			//set phaseUn
		}
		else if(this.phase =="timeup/phaseDeux"){
			this.phase = 'timeup/phaseTrois';
			this.room.setEtat(this.phase);
			let userList = this.room.getUserList();
				userList.forEach((values,key)=>{
					if(values.socket){
						values.socket.emit('goTo',this.phase);
					} 
				});

			this.startPhaseTrois();
			//set phaseUn
		}
		else if(this.phase =="timeup/phaseTrois"){
			this.phase = 'timeup/score';
			this.room.setEtat(this.phase);
			let userList = this.room.getUserList();
				userList.forEach((values,key)=>{
					if(values.socket){
						values.socket.emit('goTo',this.phase);
					} 
				});
			//set phaseUn
		}
		
	}

	randomize(tab) {
	    var i, j, tmp;
	    for (i = tab.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        tmp = tab[i];
	        tab[i] = tab[j];
	        tab[j] = tmp;
	    }
	    return tab

	}

	startPhaseUn(){
		let wordPhaseUn = this.randomize(this.listMots);
		this.timer = 45000;
	  	this.isWords = 0;
	  	this.timeLanch = false;
	  	this.wordPhase = wordPhaseUn.slice();
	  	this.wordIndex=0;
	  	this.userIterator = this.room.getUserList()[Symbol.iterator]();
	  	this.next();

	}
	startPhaseDeux(){
	let wordPhaseDeux = this.randomize(this.listMots);
		this.timer = 45000;
	  	this.isWords = 0;
	  	this.timeLanch = false;
	  	this.wordPhase = wordPhaseDeux.slice();
	  	this.wordIndex=0;
	  	this.next();

	}
	startPhaseTrois(){
	let wordPhaseTrois = this.randomize(this.listMots);
		this.timer = 60000;
	  	this.isWords = 0;
	  	this.timeLanch = false;
	  	this.wordPhase = wordPhaseTrois.slice();
	  	this.wordIndex=0;
	  	this.next();

	}

	next(){
		if(this.gameStart){
			this.namePlayer = this.getNextPlayer();
			
			this.room.getUserList().forEach((values,key)=>{
				if(values.socket){
					values.socket.emit("notYourTurn");
					values.socket.emit("namePlayer",this.namePlayer)
		  			values.socket.emit("getPoint",values.point);
		  		}
			});
			this.room.getUserByName(this.namePlayer).socket.emit("yourTurn");
		}
	}
	getNextPlayer(){
		let player = null;
		if(this.userIterator){
			player = this.userIterator.next();
			if(!player.value){
				this.userIterator = this.room.getUserList()[Symbol.iterator]();
				player= this.userIterator.next();
			}
			player = player.value[0];
		}
	return player;
	}

	playPhase(){
	if(!this.timeLanch){
		this.timeLanch = true;
		//this.room.getUserByName(this.namePlayer).socket.emit("setTimer",this.timer)
		this.timming = setTimeout(this.endTimer,this.timer,this);
		
	} 
	if(this.wordPhase.length != 0){
			this.wordIndex = (this.wordIndex+1)%this.wordPhase.length;
			this.room.getUserByName(this.namePlayer).socket.emit("newWord",this.wordPhase[this.wordIndex]);
			this.room.getUserByName(this.namePlayer).socket.emit("getPoint",this.room.getUserByName(this.namePlayer).point);
		
	}else{
		if( this.timming) clearTimeout(this.timming);
		this.nextPhase();
		}
	}

	endTimer(game){
		game.timeLanch = false;
		game.next();

	}

	passWord(){
		this.playPhase();
	}

	wordFind(word){
		this.room.getUserByName(this.namePlayer).point++;

  		this.wordPhase.splice(this.wordIndex, 1);
		this.wordIndex--;

		this.playPhase();

	}
}

module.exports = TimeUp;