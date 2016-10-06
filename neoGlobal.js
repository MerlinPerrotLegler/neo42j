var colors = require("colors");

module.exports.init = (function () {
	var logger = {
		debug : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.log((isString ? o : JSON.stringify(o, 4)).magenta);
		},
		verbose : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.log((isString ? o : JSON.stringify(o, 4)));
		},
		success : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.log((isString ? o : JSON.stringify(o, 4)).green);
		},
		info : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.log((isString ? o : JSON.stringify(o, 4)).cyan);
		},
		warn : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.warn((isString ? o : JSON.stringify(o, 4)).yellow);
		},
		error : function (o) {
			if (!o) {o = "" + o;}
			var isString = typeof o == 'string' || o instanceof String;
			console.error((isString ? o : JSON.stringify(o, 4)).red);
		}
	};
	global.log = logger;
	global.logger = logger;
	global.exist = function (obj) {
		return !(obj == null || obj == undefined);
	}
	return global;
})();

