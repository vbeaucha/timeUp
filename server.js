var http = require('http'),
	express = require('express'),
	app = express(),
	httpApp = http.Server(app),
	io = require('socket.io')(httpApp),
	low = require('lowdb'),
	FileSync = require('lowdb/adapters/FileSync'),
	fs=require('fs'),
	path = require('path'),
	ejs = require('ejs');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  var bodyParser = require("body-parser");
  var session = require('express-session');
  var flash = require('connect-flash');

let Room = require('./room.js')

var PORT= 8090,				//port du serveur web
	DB_PATH="./data/";					//répertoire où seront stockés les fichiers json de log

if (!fs.existsSync(DB_PATH)){			//si le répertoire n'existe pas, on le crée
    fs.mkdirSync(DB_PATH);
}


app.use(express["static"](__dirname + '/public'));		//indique que les fichiers se trouvent dans le dossier public
app.use(session({ secret: "cats",
				resave: true,
    			saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.set('views', __dirname + '/public');
//app.engine('html', require('ejs'));
app.set('view engine', 'ejs');

let listRoom = new Map();

/**********INIT DB******************/
const adapter = new FileSync('./data/db.json');
const db = low(adapter)

db.defaults({user: [], count: 0 })
  .write()

let numberCount = db.get('count').value();
if(numberCount == 0){
	db.get('user').push({name:'admin',
						password:'admin'})
					.write();
	db.update('count', n => n + 1)
  		.write()
}
initUser();
function initUser(){
	let listUser = db.get('user');
	for(let i = 0; i<listUser.value().length;i++){
		let user = listUser.find({name:listUser.value()[i].name});
		user.set('inGame',null).write();
		user.set('nameRoom',null).write();
	}
}
/**********************************/

/**************PASSPORT*******************/

passport.serializeUser(function(user, done){
    done(null,user.name);
});
passport.deserializeUser(function(id, done){
    let user = db.get('user').find({name:id}).value();
    if(user) done(null,user);
    else done(true,null);
});


passport.use('local-login',new LocalStrategy({
	passReqToCallback : true
},
  function(req,username, password, done) {

  	let user = db.get('user').find({name:username,password:password}).value();
  	if(user) return done(null, user);
  	else return done(null, false, req.flash('loginMessage','Bad Log'));
  }
));

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},
    function(req,username, password, done){
    	let user = db.get('user').find({name:username,password:password}).value();
    	if(user){
    		return done(null, false, req.flash('signupMessage','The username already exists' ));
    	}else{
    		let newUser = {name:username,password:password,inGame:null,nameRoom:null};
    		db.get('user').push(newUser).write();
    		db.update('count', n => n + 1).write()
    		return done(null, newUser);

    	}
    }));


function isLoggedIn(req,res,next){
if(req.isAuthenticated()){

    return next();
}
res.redirect('/login');
}

/*****************************************/


/******************WEB PAGE ********************/
app.post('/login',
  passport.authenticate('local-login', { successRedirect: '/home',
                                   failureRedirect: '/login.html',
                                   failureFlash: true })
);

app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash: true
}));

app.post('/createRoom',isLoggedIn, function(req, res){

	let nameRoom = req.body.nameRoom;
	let gameName = req.body.nameGame;
	if( nameRoom == ''){

    	res.render('home', {
        	user: req.user, message : {errorCreate : "Entrez un nom de room"}
    	});
	} else if (listRoom.get(nameRoom)){
		res.render('home', {
        	user: req.user, message : {errorCreate :"Room déjà existante"}
    	});
		
	}else{
		listRoom.set(nameRoom,new Room(gameName));
		listRoom.get(nameRoom).addUser(req.user.name);
		db.get('user').find({name:req.user.name}).set('inGame',gameName).write();
		db.get('user').find({name:req.user.name}).set('nameRoom',nameRoom).write();
		res.render(listRoom.get(nameRoom).getEtat(), {
        	user: req.user, message : {successCreate : "room created"}
    	});

		
	}
});

app.post('/joinRoom',isLoggedIn, function(req, res){
	let nameRoom = req.body.nameRoom
	if( nameRoom == ''){
    	res.render('home', {
        	user: req.user, message : {errorJoin:"Entrez un nom de room"}
    	});
	} else if (listRoom.get(nameRoom)){
		listRoom.get(nameRoom).addUser(req.user.name)
		db.get('user').find({name:req.user.name}).set('inGame',listRoom.get(nameRoom).getGameName).write();
		db.get('user').find({name:req.user.name}).set('nameRoom',nameRoom).write();
		res.render(listRoom.get(nameRoom).getEtat(), {
        	user: req.user, message : {successJoin:"Room non trouvé"}
    	});
		
	}else{
		res.render('home', {
        	user: req.user, message : {errorJoin:"Room non trouvé"}
    	});
		
	}


});

httpApp.listen(PORT, function() {
    console.log("server web start on "+PORT);
  });

app.get("/home",isLoggedIn,function(req, res) {
    //return res.redirect('index.html');
	if(req.user.inGame){
	    	let room = listRoom.get(req.user.nameRoom);
	    	if(room){
	    		res.render(room.getEtat(),{
	    			user: req.user, message :''});
	    		}
	    	else{
	    		res.render('home', {
        user: req.user, message : req.flash('info')
    	})
	    	}
	}
    else{
    	res.render('home', {
        user: req.user, message : req.flash('info')
    	});
    }	
  });

app.get('/logout', function (req, res) {
	let user = db.get('user').find({name:req.user.name})
	logoutUser(user);

    req.logout();
    res.redirect('/home');
});
app.get('/login', function (req, res) {
    res.render("login",{signupMessage : req.flash("signupMessage"),
						loginMessage: req.flash("loginMessage")});
});
app.get(":game/:page",isLoggedIn,function(req,res){
	res.render(req.params.game+"/"+req.params.page,
						{user : req.user,
						message:req.flash('info')});
})
app.get("*",isLoggedIn,function(req,res){
	res.redirect('/home');
})






/******************WEB PAGE ********************/

/*****************SOCKET**********************/

io.on('connection',function(socket){

socket.emit("sendName");

socket.on("username",function(username){
	let user = db.get('user').find({'name':username}).value();
	if(user && listRoom.get(user.nameRoom)){
		listRoom.get(user.nameRoom).setUserSocket(username,socket);
	}
});

socket.on("rageQuit",function(username){
	let user = db.get('user').find({name:username})
	logoutUser(user)
	socket.emit("goTo",'/home');
});

socket.on("error",function(err){
	console.log(err);
});

socket.on("disconnect",function(){

});

});

/*********************************************/

function logoutUser(user){
	if(user.value().inGame !=""){
		let room = listRoom.get(user.value().nameRoom);
		if(room){
			let isUser = room.logoutUser(user.value().name);
			if(!isUser) listRoom.delete(user.value().nameRoom);
		}
	}
	user.set('inGame',null).write();
	user.set('nameRoom',null).write();
}

