var socket = io.connect(window.location.hostname+':8090'); 
var recording=0;
var fileDisplayed=null;

//Configuration des Modal
$('#ModalConfig').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})

$('#ModalDelete').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
})

socket.on("Files",function(files){              //Réception de la liste de fichiers json
    var table= document.getElementById("Files");
    table.innerHTML="";                         //suppression des fichiers déja affichés dans le tableau
    document.getElementById("TableLogs").innerHTML="";  //suppression de la session deja affichée
    document.getElementById("Date").textContent="";
    var td,tr,btn;
    if (files.length==0)                        //Si aucun fichier --> affichage de "No Files"
        {
            tr=document.createElement('tr');
            table.appendChild(tr);
            td=document.createElement('td');
            tr.appendChild(td);
            td.appendChild(document.createTextNode("No Files"));
        }
    for(var i=0;i<files.length;i++)
    {
        var file_split = files[i].split('_');

        //conversion de la date et de l'heure sous un format francais
        var date_FR=file_split[0].substring(6,8)+"/"+file_split[0].substring(4,6)+"/"+file_split[0].substring(0,4);     //chaine de caractères représentant la date au format francais (jj/mm/aaaa)
        var heure=file_split[1].substring(0,2)+":"+file_split[1].substring(2,4)+":"+file_split[1].substring(4,6);
        var display=date_FR+" "+heure;

        if(file_split.length>=3)                //Si il y a un nom à la session, en plus du format de base YYYYMMDD_HHMMSS
            display=display+" "+file_split[2].substring(0,file_split[2].length-5);

        //colone nom de la session
        tr=document.createElement('tr');
        table.appendChild(tr);
        td=document.createElement('td');
        td.setAttribute("width","80%");
        tr.appendChild(td);
        var h5=document.createElement('h5');
        h5.textContent=display;
        td.appendChild(h5);

        //bouton select
        td=document.createElement('td');
        td.setAttribute("width","15%");
        btn=document.createElement('BUTTON');
        btn.setAttribute("name",files[i]);
        btn.setAttribute("class","btn btn-primary btn-block");
        btn.setAttribute("onclick","Selected(this.name)");
        btn.innerHTML="Select";
        td.appendChild(btn);
        tr.appendChild(td);

        //bouton delete
        td=document.createElement('td');
        btn=document.createElement('BUTTON');
        btn.setAttribute("name",files[i]);
        btn.setAttribute("class","btn btn-danger");
        btn.setAttribute("onclick","Delete(this.name)");
        btn.innerHTML="X";
        td.appendChild(btn);
        tr.appendChild(td);
    }
});

socket.on("JSON",function(jsonSelected){        //Reception d'un fichier json correspondant à une session
    //console.log(jsonSelected);
    var date_FR=jsonSelected.Date.substring(8,10)+jsonSelected.Date.substring(4,7)+"/"+jsonSelected.Date.substring(0,4);
    document.getElementById("Date").textContent="Session : "+date_FR+" " +jsonSelected.StartTime;
    displayLogs(jsonSelected.Logs);
});

socket.on("JSONConfig",function(jsonConfig){    //Reception d'un fichier json de config 
    var area= document.getElementById('config-body');
    area.innerHTML=JSON.stringify(jsonConfig,null,4);                         //suppression du tableau au cas ou une config avait déja été affichée avant
    
})

socket.on("connected",function(){       //Casque connecté --> appui sur Run autorisé
    document.getElementById("Run").removeAttribute("disabled");
    document.getElementById("not-connected").textContent="";
});

socket.on("disconnected",function(){   //Casque déconnecté --> appui sur Run impossible
    console.log("debut");
    if (recording)
        Stop();                                                     //arret de enregistrement
    document.getElementById("Run").setAttribute("disabled","");    //désactivation du bouton Run
    console.log("fin");
    ocument.getElementById("not-connected").textContent="Headset is not connected";
});


/*
    Affiche les Logs dans un tableau
*/
function displayLogs(Logs){
    var table=document.getElementById('TableLogs');
    table.innerHTML="";                         //suppression du tableau au cas ou des logs avaient déja été affichés

    //création de l'entete
    var tr=document.createElement('tr');
    table.appendChild(tr);
    var entete=["Time","Left","Left Rotation","Right","Right Rotation","Head","Head Orientation","Config"];      //éléments de l'entête à afficher
    entete.forEach(function(elem){
        var th=document.createElement('th');
        tr.appendChild(th);
        th.appendChild(document.createTextNode(elem));
    });

    //création du tableau de Logs
    var tbody=document.createElement('tbody');
    table.appendChild(tbody);      
    Logs.forEach(function(Log){
        var tr=document.createElement('tr');
        tbody.appendChild(tr);
        for(var key in Log)
        {
            var td=document.createElement('td');
            tr.appendChild(td);
            if(key.localeCompare("Config")!=0)          //pour tous les champs sauf config
                td.appendChild(document.createTextNode(Log[key]));
            else                                        //pour le champ config, on insere du texte clickable qui renverra vers la config correspondante
            {
                td.appendChild(document.createTextNode(Log[key]));
                td.addEventListener("click",function(){
                    socket.emit("ConfigSelected",fileDisplayed.replace('.json', '_config'+Log[key]+'.json'));
                    document.getElementById('config-text').innerHTML="Configuration "+Log[key];
                    $('#ModalConfig').modal();
                });   
            }
            
        }  
    });    
}

/*
Envoi du message "FileSelected" au serveur lors de l'appui sur le bouton Select
*/
function Selected(file){
    var table= document.getElementById('Files');
    table.innerHTML="";
    document.getElementById("select-txt").setAttribute("hidden","");
    document.getElementById("Previous").removeAttribute("hidden");
    socket.emit("FileSelected",file);
    fileDisplayed=file;

}

function Delete(file){
    $('#ModalDelete').modal();
    document.getElementById("delete-confirm").setAttribute("name",file);
}

function Previous(){
    socket.emit("GetFiles");
    document.getElementById("Previous").setAttribute("hidden","");
    document.getElementById("select-txt").removeAttribute("hidden");
}


function DeleteConfirm(file){
    socket.emit("remove",file);
    socket.emit("GetFiles");
}

function Run()
{
    recording=true;
    var btnRun=document.getElementById("Run");
    var btnStop=document.getElementById("Stop");
    btnRun.classList.remove('btn-primary');
    btnRun.classList.add('btn-outline-primary');
    btnRun.setAttribute("disabled", "");
    btnStop.classList.remove('btn-outline-secondary');
    btnStop.classList.add('btn-danger');
    btnStop.removeAttribute("disabled");
    var custom=document.getElementById("custom-name").value
    socket.emit("Run",custom);
    document.getElementById("custom-name").value="";
}

function Stop()
{
    recording=false;
    var btnRun=document.getElementById("Run");
    var btnStop=document.getElementById("Stop");
    btnRun.classList.add('btn-primary');
    btnRun.classList.remove('btn-outline-primary');
    btnRun.removeAttribute("disabled");
    btnStop.classList.add('btn-outline-secondary');
    btnStop.classList.remove('btn-danger');
    btnStop.setAttribute("disabled", "");
    socket.emit("Stop");
}

function redirectToConfigPage(){
    location.replace("http://" +window.location.hostname+":8085/");
}