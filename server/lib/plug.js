const fs = require("fs");
const path = require("path");
const print = require("./print");

var cache = {};

var register = function(plug){
    cache[plug.name] = plug;
};

exports.import = function(dir){
    var ex = fs.existsSync(dir);
    if(!ex){
        print.warn("Cannot find the specified plug-in directory");
        return;
    }else{
        var st = fs.statSync(dir);
        if(!st.isDirectory()){
            print.warn("The specified plugin address is not a valid directory");
            return;
        }
    }
    var list = fs.readdirSync(dir);
    list.forEach(function(file){

        try{
            var plug = require(path.join(dir, file));
            register(plug);
        }catch(error){
            print.warn("Failed to read the plugin - " + file);
        }
    });
};

exports.get = function(name, method){
    return cache[name].define[method];
};

exports.list = function(name){
    return cache[name].default;
};

exports.import(path.join(__dirname, "../plug"));