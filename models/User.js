var Model = require("models/Model");

function User() {
	this.type = "User";
}

User.prototype = new Model({
	login : {
		type : String,
		unique : true,
		primary : true
	},
	firstname : {
		type : String,
		primary : true		
	},
	lastname : {
		type : String,
		primary : true		
	},
	description : String,
	emails : Array,
	dateOfBirth : {
		type : Date,
		relation : "BORN_ON"
	},
});

module.exports = User;