module.exports.BSONObject = function BSONObject(obj) {
	var type = typeof(obj);
	if (type === "string") {
		return '"' + obj + '"';
	} else if (type === "number" || type === "boolean") {
		return obj;
	} else if (obj instanceof Array) {
		var str = "[";
		var isFirst = true;
		for (var idx in obj) {
			if (isFirst) {
				isFirst = false;
			} else {
				str += ","
			}
			str += BSONObject(obj[idx]);
		}
		str += "]";
		return str;
	} else if (type === "object")
		var str = "{";
		var isFirst = true;
		for (var idx in obj) {
			if (isFirst) {
				isFirst = false;
			} else {
				str += ","
			}
			str += '"';
			str += key;
			str += '":';
			str += BSONObject(obj[idx]);
		}
		str += "}";
		return str;
	} else {
		return "null";
	}
}