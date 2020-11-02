var socket = io.connect(window.location.hostname+':8080'); 
var timer = new easytimer.Timer();
document.getElementById("ConfigDiv").setAttribute("hidden","");
document.getElementById("endDiv").setAttribute("hidden","");
document.getElementById("MotDiv").setAttribute("hidden","");
document.getElementById("phaseUnDic").setAttribute("hidden","");

//Configuration des Modal

$('#ModalDelete').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})
$('#ModalErroMessage').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})



function Delete(file){
    $('#ModalDelete').modal();
}

function modalError(message){
    console.log(message);
    document.getElementById("txt-modalError").innerHTML = message;
    $('#ModalErroMessage').modal();
}

function Previous(){
    socket.emit("GetFiles");
    document.getElementById("Previous").setAttribute("hidden","");
    document.getElementById("select-txt").removeAttribute("hidden");
}

function CreateRoom(){
    let roomName = document.getElementById("createRoomName").value
    let playerName = document.getElementById("PlayerName").value
    if(roomName != "" && playerName != "") socket.emit("tryCreateNewRoom",roomName,playerName);
    else modalError("remplis tout les champs!")
}

function JoinRoom(){
    let roomName = document.getElementById("joinRoomName").value
    let playerName = document.getElementById("PlayerName").value
    if(roomName != "" && playerName != "") socket.emit("tryJoinRoom",roomName,playerName);
    else modalError("remplis tout les champs!")
}

socket.on("errorMessage",function(message){
     modalError(message);
});

socket.on("goToConfigRoom",function(roomName,isAdmin){
    document.getElementById("homeDiv").setAttribute("hidden","");
    document.getElementById("MotDiv").setAttribute("hidden","");
    document.getElementById("phaseUnDic").setAttribute("hidden","");
    document.getElementById("configRoomName").innerHTML=roomName;
    document.getElementById("ConfigDiv").removeAttribute("hidden");

    //if(!isAdmin) document.getElementById("RunGame").setAttribute("hidden","");

});

socket.on("getPlayerList",function(playerList){

    let table= document.getElementById("playerList");
    table.innerHTML=null;
    let tr,td;

    for(let i = 0 ;i<playerList.length;i++) {
        tr=document.createElement('tr');
        table.appendChild(tr);
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(playerList[i]));
      }

            
            
});

function RunGame(){
    socket.emit('startGame');
}

socket.on("chooseWords",function(){
document.getElementById("homeDiv").setAttribute("hidden","");
document.getElementById("ConfigDiv").setAttribute("hidden","");
document.getElementById("phaseUnDic").setAttribute("hidden","");
document.getElementById("MotDiv").removeAttribute("hidden");
document.getElementById('buttonWords').removeAttribute('disabled');
document.getElementById("motDisclamer").setAttribute("hidden","");

});


function SendWords(){
    let wordsOne = document.getElementById("word1").value;
    let words2 = document.getElementById("word2").value;
    let words3 = document.getElementById("word3").value;
    let words4 = document.getElementById("word4").value;
    let words5 = document.getElementById("word5").value;
    if(wordsOne !="" && words2 !=""&& words3 !=""&& words4 !=""&& words5 !="" ){
        socket.emit("playerWords",wordsOne,words2,words3,words4,words5);
        document.getElementById('buttonWords').setAttribute('disabled',"");
        document.getElementById("motDisclamer").removeAttribute("hidden");
    }
    else modalError("remplis tout les champs!");
}

socket.on("startPhaseUn",function(){
    document.getElementById("titlePhase").innerHTML = "Phase Un (45s par personne)";
    document.getElementById("homeDiv").setAttribute("hidden","");
    document.getElementById("endDiv").setAttribute("hidden","");
    document.getElementById("ConfigDiv").setAttribute("hidden","");
    document.getElementById("MotDiv").setAttribute("hidden","");
    document.getElementById("phaseUnDic").removeAttribute("hidden");

    document.getElementById("phaseUnTour").setAttribute("hidden","");
});

socket.on("startPhaseDeux",function(){
    document.getElementById("titlePhase").innerHTML = "Phase Deux (45s par personne)";
    document.getElementById("homeDiv").setAttribute("hidden","");
    document.getElementById("endDiv").setAttribute("hidden","");
    document.getElementById("ConfigDiv").setAttribute("hidden","");
    document.getElementById("MotDiv").setAttribute("hidden","");
    document.getElementById("phaseUnDic").removeAttribute("hidden");

    document.getElementById("phaseUnTour").setAttribute("hidden","");
});
socket.on("startPhaseTrois",function(){
    document.getElementById("titlePhase").innerHTML = "Phase trois (60s par personne)";
    document.getElementById("homeDiv").setAttribute("hidden","");
    document.getElementById("endDiv").setAttribute("hidden","");
    document.getElementById("ConfigDiv").setAttribute("hidden","");
    document.getElementById("MotDiv").setAttribute("hidden","");
    document.getElementById("phaseUnDic").removeAttribute("hidden");

    document.getElementById("phaseUnTour").setAttribute("hidden","");
});
socket.on("endGame",function(){
    document.getElementById("titlePhase").innerHTML = "Phase trois (60s par personne)";
    document.getElementById("homeDiv").setAttribute("hidden","");
    document.getElementById("endDiv").removeAttribute("hidden");
    document.getElementById("ConfigDiv").setAttribute("hidden","");
    document.getElementById("MotDiv").setAttribute("hidden","");
    document.getElementById("phaseUnDic").setAttribute("hidden","");


});
socket.on("yourTurn",function(){
    document.getElementById("phaseUnPasTour").setAttribute("hidden","");
    document.getElementById("phaseUnTour").removeAttribute("hidden");

    document.getElementById("readyToPlay").removeAttribute("disabled");
    document.getElementById("wordsFind").setAttribute("disabled","");
    document.getElementById("wordsPass").setAttribute("disabled","");
    document.getElementById("wordsAnwser").innerHTML ="";
});
socket.on("notYourTurn",function(){
    document.getElementById("phaseUnPasTour").removeAttribute("hidden");
    document.getElementById("phaseUnTour").setAttribute("hidden","");
    
});

socket.on("getPoint",function(point){
    document.getElementById("playerPoint").innerHTML ="vos points: "+ point;
});

function readyToPlay(){
    socket.emit("readyToPlay");
    
    document.getElementById("readyToPlay").setAttribute("disabled","");
    document.getElementById("wordsFind").removeAttribute("disabled");
    document.getElementById("wordsPass").removeAttribute("disabled");
}
function wordsFind(){
    let word = document.getElementById("wordsAnwser").innerHTML;
    socket.emit("wordFind",word);
}
function wordsPass(){
    let word = document.getElementById("wordsAnwser").innerHTML;
    socket.emit("wordPass",word);
}

socket.on("newWord",function(word){
    document.getElementById("wordsAnwser").innerHTML = word;
});

socket.on("getPlayersPoint",function(playerName,point){
    console.log(playerName,point);
    let table= document.getElementById("endTable");
    let tr,td;

        tr=document.createElement('tr');
        table.appendChild(tr);
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(playerName));
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(point));
});

socket.on("setTimer",function(time){
    time = (time/1000)-1;
timer.start({countdown: true, startValues: {seconds: time}});
    $('#countdown .values').html(timer.getTimeValues().toString());
});

socket.on("endTimer",function(){
    console.log("coucou");
    timer.stop();
    
});


$('#countdown .values').html(timer.getTimeValues().toString());
timer.addEventListener('secondsUpdated', function (e) {
    $('#countdown .values').html(timer.getTimeValues().toString());
});
timer.addEventListener('reset', function (e) {
    $('#chronoExample .values').html(timer.getTimeValues().toString());
});
