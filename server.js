let Team = require("./team.js");


let newTeam = new Team();
newTeam.addPlayer("valentin");
newTeam.addPlayer("polo");
console.log(newTeam.getPlayer());
newTeam.removePlayer("mark")
console.log(newTeam.getPlayer());