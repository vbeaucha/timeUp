var socket = io.connect(window.location.hostname+':8090'); 

$('#errorMessage').hide();
$('#waitMessage').hide();

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


function confirmStart(file){
    $('#ModalConfirm').modal();
}

function rageQuit(){
	socket.emit("rageQuit",username);
}

function confirmWords(){
	let words = new Array();
	let ready = true;
	document.getElementById('errorMessage').innerHTML=""
	if(document.getElementById('motUn').value != ""){
		words.push(document.getElementById('motUn').value);
	}else{
		ready = false;
		document.getElementById('errorMessage').innerHTML+=
		'<div class="input-group mb-3"><div class="input-group-prepend">'+"<label>Entrez un 1er mot</label>"+'</div></div>';
		
	}
	if(document.getElementById('motDeux').value != ""){
		words.push(document.getElementById('motDeux').value);
	}else{
		ready = false;
		document.getElementById('errorMessage').innerHTML+=
		'<div class="input-group mb-3"><div class="input-group-prepend">'+"<label>Entrez un 2eme mot</label>"+'</div></div>';
	}
	if(document.getElementById('motTrois').value != ""){
		words.push(document.getElementById('motTrois').value);
	}else{
		ready = false;
		document.getElementById('errorMessage').innerHTML+=
		'<div class="input-group mb-3"><div class="input-group-prepend">'+"<label>Entrez un 3eme mot</label>"+'</div></div>';
	}
	if(document.getElementById('motQuatre').value != ""){
		words.push(document.getElementById('motQuatre').value);
	}else{
		ready = false;
		document.getElementById('errorMessage').innerHTML+=
		'<div class="input-group mb-3"><div class="input-group-prepend">'+"<label>Entrez un 4eme mot</label>"+'</div></div>';
	}
	if(document.getElementById('motCinq').value != ""){
		words.push(document.getElementById('motCinq').value);

	}else{
		ready = false;
		document.getElementById('errorMessage').innerHTML+=
		'<div class="input-group mb-3"><div class="input-group-prepend">'+"<label>Entrez un 5eme mot</label>"+'</div></div>';
	}
	if(ready){
		socket.emit("words",words);
		$('#waitMessage').show();
	}
	if(!ready){
		$('#errorMessage').show();
		$('#errorMessage').fadeOut(1500);
	}
}