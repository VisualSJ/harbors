var cache = {};


var register = function(name, object){
    cache[name] = object;
};

register("param", require("../plug/param"));


exports.get = function(name, method){
    return cache[name][method];
};