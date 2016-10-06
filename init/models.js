var ModelMgr = require("models/ModelMgr");

module.exports.init = function () {

	require('fs').readdirSync(__baseDirName + "/models").forEach(function (file) {
		if (file == "Model.js" || file.search(".*Mgr.js") != -1) {
			return ;
		}
		log.info("Intializing model : " + file);
		try {
			var currentModel = require("models/" + file);
			ModelMgr.initModel(currentModel);
		} catch (e) {
			log.error(e);
		}
	});
};