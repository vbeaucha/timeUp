var socket = io.connect(window.location.hostname+':8090'); 

$('#ModalConfirm').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})

socket.on("sendName",function(){
	socket.emit("username",username)
});

socket.on("goTo",function(link){
	console.log(link);
	location.href =link;
});


function rageQuit(){
	socket.emit("rageQuit",username);
}

socket.on("notYourTurn",function(){
	console.log("no turn")
	document.getElementById("getWord").innerHTML="";
	document.getElementById("getWord").hidden=true;
	document.getElementById("readyButton").disabled = true;
	document.getElementById("findButton").disabled = true;
	document.getElementById("passButton").disabled = true;
	document.getElementById("passTurnButton").disabled = true;
});

socket.on("namePlayer",function(namePlayer){
	console.log(namePlayer);
	document.getElementById("playerId").innerHTML=namePlayer;
})

socket.on("getPoint",function(point){
	document.getElementById("point").innerHTML=point;
});

socket.on("yourTurn",function(){
	console.log("yourTurn")
	document.getElementById("passTurnButton").disabled = false;
	document.getElementById("readyButton").disabled = false;
})

socket.on("newWord",function(word){
	document.getElementById("getWord").innerHTML=word;
	document.getElementById("getWord").hidden=false;
});


function passTour(){
	socket.emit("passTour");
}

function passWord(){
	socket.emit("passWord");
}

function findWord(){
	let word = document.getElementById("getWord").innerHTML;
	socket.emit("findWord",word);
}

function readyToPlay(){
	socket.emit("ready");
	document.getElementById("passTurnButton").disabled = true;
	document.getElementById("readyButton").disabled = true;
	document.getElementById("findButton").disabled = false;
	document.getElementById("passButton").disabled = false;
}