let Room = require("./room.js");


let newRoom = new Room();

newRoom.createTeam("test");
newRoom.addPlayerToTeam('test',"valentin");
newRoom.addPlayerToTeam('test',"polo");
console.log(newRoom.getPlayerListOfTeam('test'));

newRoom.removePlayerToTeam("test","valentin");
console.log(newRoom.getPlayerListOfTeam('test'));