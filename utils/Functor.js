/**
 * @class Functor
 */

/**
 * @function __constructor__
 * @parm obj will be used as this for the function
 * @parm func will be called as a member function of the obj parameter
 */
module.exports = function (obj, func) {
	var Obj = obj;
    return function () {
    	func.apply(Obj, arguments); 
    };
};