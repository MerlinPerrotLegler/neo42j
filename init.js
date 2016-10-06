var assert = require('assert');
require("neoGlobal");

module.exports = (function () {
	global.__baseDirName = __dirname;

	require('fs').readdirSync(__baseDirName + "/init").forEach(function (file) {
		console.log("Initalizing : 'init/" + file + "'");
		try {
			var currentModel = require("init/" + file);
			currentModel.init();
			log.info("Initalizing : 'init/" + file + "' OK");
		} catch (e) {
			log.error("Initalizing : 'init/" + file + "' KO => " + e);
		}
	});
})();