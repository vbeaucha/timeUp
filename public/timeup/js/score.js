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

socket.on("getScore",function(scores){

	let table= document.getElementById("endTable");
    table.innerHTML=null;
    let tr,td;

    for(let i = 0;i<scores.length;i++){
        tr=document.createElement('tr');
        table.appendChild(tr);
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(scores[i].name));
        td=document.createElement('td');
        tr.appendChild(td);
        td.appendChild(document.createTextNode(scores[i].point));
      }
});
