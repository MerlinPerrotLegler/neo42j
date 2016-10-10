var neo4j = require('node-neo4j');
var config = require("config/storage.json");

var print = function (err, result) {
	if (err) {
		console.error(err);
	}
	if (result) {
		console.info(result);
	}
}

var Connection = function () {
	this.db = new neo4j(config.server);
}

Connection.prototype.run = function (query, params,callback) {
	console.log("Connection :\nquery=" + query + "\nparams=" + JSON.stringify(params) + "\ncallback=" + callback);
	this.db.cypherQuery(
		query,
		params || {},
		callback || print
	);
}

module.exports = Connection;
