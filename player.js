module.export = class player{
	name;
	socket;

	constructor(name,socket){
		this.name = name;
		this.socket = socket || null;
	}

	getName(){
		return this.name;
	}

	setSocket(socket){
		this.socket = socket;
	}

	getSocket(){
		return this.socket;
	}
}