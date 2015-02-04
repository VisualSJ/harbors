const fs = require("fs");
const path = require("path");
const print = require("./print");

var cache = {};

/**
 * 注册一个插件到列表中
 * @param {Object} plug
 */
var register = function(plug){
    cache[plug.name] = plug;
};

/**
 * 传入一个文件夹
 * 导入这个文件夹中所有符合标准的插件
 * @param {String} dir
 */
exports.import = function(dir){
    var st, ex = fs.existsSync(dir);
    if(!ex){
        print.warn("Cannot find the specified plug-in directory");
        return;
    }else{
        st = fs.statSync(dir);
        if(!st.isDirectory()){
            print.warn("The specified plugin address is not a valid directory");
            return;
        }
    }
    //判断相对目录还是绝对目录
    var tDir = path.join(process.cwd(), dir);
    ex = fs.existsSync(tDir);
    if(ex){
        st = fs.statSync(dir);
        if(st.isDirectory()){
            dir = tDir;
        }
    }

    var list = fs.readdirSync(dir);
    list.forEach(function(file){

        try{
            var plug = require(path.join(dir, file));
            if(plug.name)
                register(plug);
        }catch(error){
            print.warn(error);
            print.warn("Failed to read the plugin - " + file);
        }
    });
};

/**
 * 获取一个插件内的指定方法
 * @param {String} name
 * @param {String} method
 * @returns {Function}
 */
exports.get = function(name, method){
    return cache[name].define[method];
};

/**
 * 获取一个插件内自动导入的方法列表
 * @param {String} name
 * @returns {Array}
 */
exports.list = function(name){
    return cache[name].default;
};

exports.import(path.join(__dirname, "../plug"));