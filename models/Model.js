var Connection = require ("database/Connection");
var Functor = require ("utils/Functor");

var SAVING_SATUS = {
    NOT_SAVED       : 0,
    SAVING          : 1, 
    SAVED           : 2,
    SAVING_FAILED   : 4
};

var LOADING_SATUS = {
    NOT_LOADED      : 0,
    LOADING         : 1,
    LOADED          : 2,
    LOADING_FAILD   : 4
};

var INITALIZE_STATUS = {
    NOT_INITALIZED  : 0,
    INITALIZED      : 1
}

function Model(model) {
    this.type = null;
    this.unique = [];
    this.primary = [];
    this.savingStatus = SAVING_SATUS.NOT_SAVED;
    this.loadingStatus = LOADING_SATUS.NOT_LOADED;
    this.initalizeStatus = INITALIZE_STATUS.NOT_INITALIZED;
    this.attrs = {};
    this.changes = {};
    this.model = {
        createOn : {
            type : Date,
            relation : "CREATED_ON"
        }
    };
    if (model) {
        this.mergeModel(model);
    }
    this.interpretModel();
}

Model.prototype.mergeModel = function (model) {
    if (!this.model) {
        this.model = {};
    }
    for (var key in model) {
        this.model[key] = model[key];
    }
}

Model.prototype.initalize = function () {
    if (this.initalizeStatus == INITALIZE_STATUS.NOT_INITALIZED) {
        this.interpretModel();
        this.initalizeStatus = INITALIZE_STATUS.INITALIZED;
    }
}

Model.prototype.interpretModel = function () {
    this.unique = [];
    this.primary = [];
    for (var key1 in this.model) {
        var obj1 = this.model[key1];
        if (typeof obj1 == "object") {
            if (obj1.unique == true) {
                this.unique.push(key1);
            } else if (obj1.primary == true) {
                this.primary.push(key1);
            }
        }
    }
}

Model.prototype.assingValueFromResponse = function (key, value) {
    if (key in this.model) {
        var constructor = this.model[key];
        if (typeof constructor != 'function' && constructor.type) {
            constructor = constructor.type
        }
        if (typeof constructor != 'function') { 
            throw "Invalid model " + this.type + " for key=" + key + " value=" + JSON.stringify(value) + " constructor=" + constructor;
        }
        this.attrs[key] = new constructor(value);
    } else {
        this.attrs[key] = value;
    }
}

Model.prototype.interpretResponse = function (response) {
    if (response.columns && response.data) {
        var len = response.columns.length;
        for (var idx  = 0; idx < len; ++i) {
            var key = response.columns[idx];
            this.assingValueFromResponse(response.columns[idx], response.data[idx])
        }
    } else {
        log.error(response);
    }
}

Model.prototype.interpretFullResponse = function (response) {
    if (response.data.length == 1) {
        var obj = response.data[0];
        for (var key in obj) {
            this.assingValueFromResponse(key, obj[key]);
        }
    } else {
        log.error(response);
    }
}


Model.prototype.get = function (attrName) {
    if (attrName in this.changes) {
        throw "the " + attrName + " has changes since. Please save the object before you use it."
    }
    return this.attrs[attrName];
}

Model.prototype.set = function (attrName, value) {
    this.changes[attrName] = value;
    return this;
}

Model.prototype.hasChanged = function () {
    return Object.keys(this.changes).length > 0;
}

Model.prototype.defineIndex = function () {
    if (this.type && this.primary) {
        var query = "CREATE INDEX ON :{type}({primary})";
        var connection = new Connection();
        connection.run(query, {
            type : this.type,   
            primary : this.primary
        });
    }
}

Model.prototype.defineConstraint = function () {
    if (this.type && this.unique && this.unique.length > 0) {
        var query;
        var connection = new Connection();
        for (var i in this.unique) {
            query = "CREATE CONSTRAINT ON (obj:{type}) ASSERT obj.{unique} IS UNIQUE ";
            connection.run(query, {
                type : type,
                unique : this.unique[i]
            });
        }
    }
}

Model.prototype.query = {};

Model.prototype.queryType = function () {
    if (this.type) {   
        var query = ":"; 
        query += this.type;
        query += " ";
        return query;
    }
    return null;
}

Model.prototype.queryChanges = function () {
    if (this.hasChanged()) {
        var query = "";
        for (var i in this.changes) {
            if (i > 0) {
                query += ",obj.";
            } else {
                query += "obj.";                
            }
            query += this.changes[i];
        }
    }
    return null;
}

Model.prototype.queryFirstUnique = function (attribute) {
    if (!attribute) {
        attribute = "attrs";
    }
    this.initalize();
    for (var i in this.unique) {
        var key = this.unique[i];
        if (key in this[attribute] && exist(this[attribute][key])) {
            var query = key;
            query += " : ";
            query += this.format(this[attribute][key]);
            return query;
        }
    }
    return null;
}

Model.prototype.queryAllPrimary = function (attribute) {
    if (!attribute) {
        attribute = "attrs";
    }
    this.initalize();
    var query = null;
    for (var i in this.primary) {
        var key = this.primary[i];

        if (key in this[attribute] && exist(this[attribute][key])) {
            if (query) {
                query += ", "
            } else {
                query = "";
            }
            query += key;
            query += " : ";
            query += this.format(this[attribute][key]);
        }
    }
    return query;
}


Model.prototype.create = function (callback) {
    this.savingStatus = SAVING_SATUS.SAVEING;
    this.loadingStatus = LOADING_SATUS.LOADING;
    
    var query = "CREATE (obj";
    query += this.queryType() || '';
    query += this.format(this.changes);
    query += ") RETURN obj";

    var connection = new Connection();
    
    connection.run(query, null, Functor(this, function (err, result) {
        if (result) {
            this.changes = {};
            this.interpretFullResponse(result);
            this.savingStatus = SAVING_SATUS.SAVED;
            this.loadingStatus = LOADING_SATUS.LOADED;
         } else {
            if (err) {
                log.error(err);                
            } else {
                log.warn("Could not create '" + query + "'");                    
            }
            this.savingStatus = SAVING_SATUS.NOT_SAVED;
            this.loadingStatus = LOADING_SATUS.NOT_LOADED;
        }
        if (callback) {
            callback(err, result);
        }
    }));
}

Model.prototype.load = function () {
    var query = "MATCH (obj";

    query += this.queryType();

    query += "{";
    query += this.queryFirstUnique() || this.queryFirstUnique('changes') || this.queryAllPrimary() || this.queryAllPrimary('changes') || ''
    query += "}) RETURN obj LIMIT 1";

    this.loadingStatus = LOADING_SATUS.LOADING;
    var connection = new Connection();
    connection.run(query, Functor(this, function (err, result) {
        if (result) {
            this.interpretFullResponse(result);
            this.loadingStatus = LOADING_SATUS.LOADED;
        } else {
            if (err) {
                log.error(err);                
            } else {
                log.warn("Could not load '" + query + "'");                    
            }
            this.loadingStatus = LOADING_SATUS.LOADING_FAILD;
        }
        if (callback) {
            callback(err, result);
        }
    }));
}

Model.prototype.save = function (callback) {
    if (this.loadingStatus != LOADING_SATUS.LOADED) {
        throw "Forbidden action : save, the object has not been loaded";
    }
    if (!this.hasChanged()) {
        throw "Cloud not save, no change have been made";
    }
    this.savingStatus = SAVING_SATUS.SAVEING;
    var query = "MERGE (obj";

    query += this.queryType();
    query += " {"
    query += this.queryFirstUnique() || this.queryAllPrimary()
    query += "}) SET ";
    var isFirst = true;
    for (var key in this.changes) {
        if (isFirst) {
            isFirst = false;
        }else {
            query += ",";
        }
        query += "obj.";
        query += key
        query += " = ";
        query += this.format(this.changes[key]);
    }
    query += " RETURN obj";

    var connection = new Connection();
    
    connection.run(query, null, Functor(this, function (err, result) {
        if (result) {
            this.savingStatus = SAVING_SATUS.SAVED;
            this.changes = {};
         } else {
            if (err) {
                log.error(err);                
            } else {
                log.warn("Could not create '" + query + "'");                    
            }
            this.savingStatus = SAVING_SATUS.NOT_SAVED;
        }
        if (callback) {
            callback(err, result);
        }
    }));
}

Model.prototype.format = function (obj) {
    var type = typeof(obj);
    if (type === "string" || obj instanceof String) {
        return '"' + obj + '"';
    } else if (type === "number" || type === "boolean" || obj instanceof Number || obj instanceof Boolean) {
        return obj;
    } else if (type === "date" || obj instanceof Date) {
        return obj.getTime();
    } else if (obj instanceof Array) {
        var str = "[";
        var isFirst = true;
        for (var idx in obj) {
            if (typeof obj[idx] == "function") {
                continue;
            }
            if (isFirst) {
                isFirst = false;
            } else {
                str += ","
            }
            str += this.format(obj[idx]);
        }
        str += "]";
        return str;
    } else if (type === "object") {
        var str = "{";
        var isFirst = true;
        for (var key in obj) {
            if (typeof obj[key] == "function") {
                continue;
            }
            if (isFirst) {
                isFirst = false;
            } else {
                str += ","
            }
            str += key;
            str += ":";
            str += this.format(obj[key]);
        }
        str += "}";
        return str;
    } else {
        return "null";
    }
}

module.exports = Model;
module.exports.SAVING_SATUS = SAVING_SATUS;
module.exports.LOADING_SATUS = LOADING_SATUS;
module.exports.INITALIZE_STATUS = INITALIZE_STATUS;

