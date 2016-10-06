var Connection = require ("database/Connection");

module.exports.initModel = function (model) {
	var initData = interpretModel(model);
	defineIndex(model, initData.unique);
	defineConstraint(model, initData.primary);
}

module.exports.search = function (model, request) {


}

module.exports.buildFromResponse = function (model, response) {
    var objs = null;
    
    if (    'columns' in response && exist(response.columns)
        &&  'data' in response && exist(response.data)) {
        objs = [];
        for (var index in response.data) {
            var objData = response.data[index];
            var obj = new model();
            for (var key in obj) {
                obj.assingValueFromResponse(key, objData[key]);
            }
            objs.push(obj);
        }
    } else {
        log.error(response);
    }
    return objs;
}

/************************/
/*      PRIVATE         */
/************************/
var interpretModel = function (model) {
    unique = [];
    primary = [];
    for (var keyk in model.model) {
        var obj = model.model[key1];
        if (typeof obj == "object") {
            if (obj.unique == true) {
                unique.push(key);
            } else if (obj.primary == true) {
                primary.push(key);
            }
        }
    }
    return {
    	unique: 	unique,
    	primary: 	primary
    }
}

var defineIndex = function (model, primary) {
    if (model.type && primary) {
        var query = "CREATE INDEX ON :{type}({primary})";
        var connection = new Connection();
        for (var i in primary) {
        	console.verbose(query);
	        connection.run(query, {
	            type : model.type,
	            primary : primary[i]
	        });
	    }
    }
}

var defineConstraint = function (model, unique) {
    if (model.type && unique && unique.length > 0) {
        var query = "CREATE CONSTRAINT ON (obj:{type}) ASSERT obj.{unique} IS UNIQUE ";
        var connection = new Connection();
        for (var i in unique) {
        	console.verbose(query);
            connection.run(query, {
                type : type,
                unique : unique[i]
            });
        }
    }
}
