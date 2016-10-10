var Connection = require ("database/Connection");
var connection = new Connection();
connection.run("MATCH (n) OPTIONAL MATCH (n)-[r]-() DELETE n,r", {}, function () {

	require("init.js");
	require("tests/storage-user");

});


