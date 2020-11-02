var http = require('http'),
	express = require('express'),
	app = express(),
	httpApp = http.Server(app),
	io = require('socket.io')(httpApp),
	low = require('lowdb'),
	FileSync = require('lowdb/adapters/FileSync'),
	fs=require('fs'),
	path = require('path');

var PORT= 8080,				//port du serveur web
	DB_PATH="/data/";					//répertoire où seront stockés les fichiers json de log

if (!fs.existsSync(DB_PATH)){			//si le répertoire n'existe pas, on le crée
    fs.mkdirSync(DB_PATH);
}
let roomList = new Map();
let socketList = new Map();
/******************WEB PAGE ********************/
httpApp.listen(PORT, function() {
    console.log("server web start on "+PORT);
  });

app.get("/",function(req, res) {							//redirige  vers index.html.
    return res.redirect('index.html');	
  });

app.use(express["static"](__dirname + '/public'));		//indique que les fichiers se trouvent dans le dossier public

io.on('connection',function(socket){
console.log("new Client connected : " +socket.handshake.address);
socket.isPlayer=false;


socket.on("error",function(err){
	console.log(err);
});

socket.on("disconnect",function(){
	if (socket.isPlayer){
		console.log(socket.playerName + " disconnected");
		deconnectionPlayer(socket);
	}
	else console.log("client disconnected");
});

socket.on("tryCreateNewRoom",function(roomName,playerName){
	if(roomList.get(roomName) == null){
		roomList.set(roomName,new Object());
		roomList.get(roomName).name = roomName;
		roomList.get(roomName).playerList = new Array();
		roomList.get(roomName).playerPoint = new Map();
		roomList.get(roomName).playerList.push(playerName);
		roomList.get(roomName).playerPoint.set(playerName,0);
		roomList.get(roomName).gameStart=false;
		socket.isPlayer=true;
		socket.playerName=playerName;
		socket.playerRoom = roomName;
		socket.isAdmin = true;
		socketList.set(playerName,socket)
		console.log(roomName +" Created")

		socket.emit("goToConfigRoom",roomName,true);
		sendListToAllPlayer(roomName)
	}else{
		socket.emit("errorMessage","Room "+ roomName +"dejà créer");
	}
});

socket.on("tryJoinRoom",function(roomName,playerName){
	if(roomList.get(roomName) != null){
		roomList.get(roomName).playerList.push(playerName);
		roomList.get(roomName).playerPoint.set(playerName,0);
		socket.isPlayer=true;
		socket.playerName=playerName;
		socket.playerRoom = roomName;
		socket.isAdmin = false;
		socketList.set(playerName,socket);
		socket.emit("goToConfigRoom",roomName,false);
		sendListToAllPlayer(roomName)
	}else{
		socket.emit("errorMessage","Room "+ roomName +" not found");
	}
});


socket.on("startGame",function(){
	StartGame(socket);
});

socket.on("playerWords",function(word1,word2,word3,word4,word5){
	if(!socket.asChooseWord){
		addWordsToList(socket.playerRoom,word1,word2,word3,word4,word5);
		socket.asChooseWord=true;
		checkIfEveryOneReady(socket.playerRoom);
	}
});

socket.on("readyToPlay",function(){
	let room = roomList.get(socket.playerRoom);
	if(room){
		playPhase(room);
	}
});

socket.on("wordFind",function(word){
	wordFind(socket.playerName,socket.playerRoom,word);
});
socket.on("wordPass",function(word){
	wordPass(socket.playerRoom,word);
});

});


/******************WEB PAGE ********************/

function sendListToAllPlayer(roomName){
	let room = roomList.get(roomName);
	if(room){
	socketList.forEach((values,socketKey)=>{
		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.emit("getPlayerList",room.playerList);
  		}
  		//
	}
	});
}
	

}

function deconnectionPlayer(socket){
	let room = roomList.get(socket.playerRoom);
	if(room){

	const index = room.playerList.indexOf(socket.playerName);

	if (index > -1) {
  		room.playerList.splice(index, 1);
	}
	console.log(room.isPlayer,index);
	if(room.gameStart && room.isPlayer == index){
		console.log("coucou")
		room.isPlayer = (room.isPlayer+1)%room.playerList.length;
		if(socketList.get(room.playerList[room.isPlayer])){
		socketList.get(room.playerList[room.isPlayer]).emit("yourTurn");
		socketList.get(room.playerList[room.isPlayer]).emit("getPoint",room.playerPoint.get(room.playerList[room.isPlayer]));
	}
	}
	if(room.playerList.length != 0){

		sendListToAllPlayer(socket.playerRoom);
	}
	else{
		console.log("delete room");
		roomList.delete(socket.playerRoom);
	}
}
}

function StartGame(socket){

	let room = roomList.get(socket.playerRoom);
	if(room && !room.gameStart){
		room.gameStart=true;
		room.wordList = new Array();
		room.phase = "chooseWords";
	socketList.forEach((values,socketKey)=>{

		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.asChooseWord=false;
  			
  			values.emit("chooseWords");
  		}
	}
	});
	}else{
		if(room.phase =="un"){
			socket.emit("startPhaseUn");
		}else if(room.phase =="deux"){
			socket.emit("startPhaseDeux");
		}else if(room.phase =="trois"){
			socket.emit("startPhaseTrois");
		}else if(room.phase =="chooseWords"){
			socket.asChooseWord=false;
			socket.emit("chooseWords");
		}
		
	}
}

function addWordsToList(roomName,word1,word2,word3,word4,word5){
	let room = roomList.get(roomName);
	if(room){
		room.wordList.push(word1);
		room.wordList.push(word2);
		room.wordList.push(word3);
		room.wordList.push(word4);
		room.wordList.push(word5);
	}
}

function checkIfEveryOneReady(roomName){
	let room = roomList.get(roomName);
	if(room){
		let ready = true;
		socketList.forEach((values,socketKey)=>{

		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			if(!values.asChooseWord) ready=false;
  		}
	}
	});

		if(ready){
			console.log("everybody ready")
			startPhaseUn(room);
		}
	}
}

function startPhaseUn(room){
	let wordPhaseUn = randomize(room.wordList.slice());
	room.timer = 46000;
  		room.isPlayer = 0;
  		room.isWords = 0;
  		room.timeLanch = false;
  		room.phase = "un";
  		room.wordPhase = wordPhaseUn.slice();
	socketList.forEach((values,socketKey)=>{

		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.emit("startPhaseUn");
  			console.log(room.playerList[i]);
  			console.log(room.playerPoint.get(room.playerList[i]));
  			values.emit("getPoint",room.playerPoint.get(room.playerList[i]));
  			
  		}
  		
  		
  		socketList.get(room.playerList[0]).emit("yourTurn");
	}
	});

}

function startPhaseDeux(room){
	if( room.timming) clearTimeout(room.timming);
	room.isPlayer = (room.isPlayer+1)%room.playerList.length;

	let wordPhaseDeux = randomize(room.wordList.slice());

	room.timer = 46000;
  		room.isWords = 0;
  		room.timeLanch = false;
  		room.phase = "deux";
  		room.wordPhase = wordPhaseDeux.slice();
	socketList.forEach((values,socketKey)=>{
		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.emit("startPhaseDeux");
  			values.emit("getPoint",room.playerPoint.get(room.playerList[i]));
  			
  		}
  		
  		socketList.get(room.playerList[room.isPlayer]).emit("yourTurn");
	}
	});

}

function startPhaseTrois(room){
	if( room.timming) clearTimeout(room.timming);
	room.isPlayer = (room.isPlayer+1)%room.playerList.length;
	let wordPhaseDeux = randomize(room.wordList.slice());
	room.timer = 61000;
  		room.isWords = 0;
  		room.timeLanch = false;
  		room.phase = "trois";
  		room.wordPhase = wordPhaseDeux.slice();
	socketList.forEach((values,socketKey)=>{
		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.emit("startPhaseTrois");
  			values.emit("getPoint",room.playerPoint.get(room.playerList[i]));
  			
  		}
  		
  		socketList.get(room.playerList[room.isPlayer]).emit("yourTurn");
	}
	});

}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function randomize(tab) {
    var i, j, tmp;
    for (i = tab.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        tmp = tab[i];
        tab[i] = tab[j];
        tab[j] = tmp;
    }
    return tab

}

function playPhase(room){
	if(!room.timeLanch){
		room.timeLanch = true;
		socketList.get(room.playerList[room.isPlayer]).emit("setTimer",room.timer)
		room.timming = setTimeout(endTimer,room.timer,room);
		
	} 
	if(room.wordPhase.length != 0){
		if(socketList.get(room.playerList[room.isPlayer])){
			room.isWords = (room.isWords+1)%room.wordPhase.length;
			socketList.get(room.playerList[room.isPlayer]).emit("newWord",room.wordPhase[room.isWords])
			socketList.get(room.playerList[room.isPlayer]).emit("getPoint",room.playerPoint.get(room.playerList[room.isPlayer]));
		}
		
	}else{
		socketList.get(room.playerList[room.isPlayer]).emit("endTimer");
		changePhase(room);
	}
}


function endTimer(room){
	room.timeLanch=false;
	if(socketList.get(room.playerList[room.isPlayer])){
		socketList.get(room.playerList[room.isPlayer]).emit("notYourTurn");
		socketList.get(room.playerList[room.isPlayer]).emit("getPoint",room.playerPoint.get(room.playerList[room.isPlayer]));
	}
	room.isPlayer = (room.isPlayer+1)%room.playerList.length;
	if(socketList.get(room.playerList[room.isPlayer])){
		socketList.get(room.playerList[room.isPlayer]).emit("yourTurn");
		socketList.get(room.playerList[room.isPlayer]).emit("getPoint",room.playerPoint.get(room.playerList[room.isPlayer]));
	}

}

function wordFind(playerName,roomName,word){
	let room = roomList.get(roomName);
	if(room){
		let playerName = room.playerList[room.isPlayer];
		let playerPoint = room.playerPoint.get(playerName);

		room.playerPoint.set(playerName,playerPoint+1)
		const index = room.wordPhase.indexOf(word);
		if (index > -1) {
  			room.wordPhase.splice(index, 1);
		}

		playPhase(room);
	}
}

function changePhase(room){
	if(room.phase =="un"){
		startPhaseDeux(room);
	}else if(room.phase=="deux"){
		startPhaseTrois(room);
	}else if(room.phase == "trois"){
		endGame(room);
	}
}

function endGame(room){
	socketList.forEach((values,socketKey)=>{
		for(let i = 0 ;i<room.playerList.length;i++) {
  		if(room.playerList[i] == socketKey){
  			values.emit("endGame",room.playerPoint);
  			socketList.forEach((otherValue,otherSocketKey)=>{
			for(let j = 0 ;j<room.playerList.length;j++) {
				if(room.playerList[j] == otherSocketKey){
					values.emit("getPlayersPoint",room.playerList[j],room.playerPoint.get(room.playerList[j]));
				}
			}
			});
  			
  		}
	}
	});
}

function wordPass(roomName,word){
let room = roomList.get(roomName);
	if(room){
		playPhase(room);
	}
}

setInterval(broadcast,1000);
function broadcast(){
	socketList.forEach((values,socketKey)=>{
		values.emit("ping");
	});
}

