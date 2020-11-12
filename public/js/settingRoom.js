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


socket.on('listPlayer',function(listPlayer){
	console.log(listPlayer)
	let table= document.getElementById("listPlayer");
    table.innerHTML=null;
    let tr,td;
	for(let i = 0; i< listPlayer.length;i++){
		tr=document.createElement('tr');
        table.appendChild(tr);
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(listPlayer[i].name));
	}
});

function confirmStart(file){
    $('#ModalConfirm').modal();
}

function startGame(){
	socket.emit("startGame",username);
}

function rageQuit(){
	socket.emit("rageQuit",username);
}