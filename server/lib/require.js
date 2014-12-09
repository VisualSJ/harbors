const fs = require("fs");
const path = require("path");
const plug = require("./plug");
const infoPage = require("./infoPage");

/**
 * 找到指定的动态模块
 * 并且传递给handle方法
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Function} next
 */
module.exports = function(request, response, config, next){
    if(!config)
        return next();

    var dir = config.controllerDir,
        list = config.require,
        url = request.url;

    if(!dir || !url)
        return next();

    var index = url.indexOf("?");
    if(index !== -1)
        url = url.substr(0, index);

    if(/\/$/.test(url))
        url += "index";

    var address = path.join(dir, url);
    var fileName, item;
    for(var p in list){
        item = list[p];
        fileName = address + item.extName;
        if(fs.existsSync(fileName)){
            try{
                return handle(require(fileName), request, response, item, next);
            }catch(error){
                infoPage(request, response, {
                    state: "500",
                    title: "Internal error",
                    text: "The server has encountered some unexpected during operation.\nPlease check and try again:\n    " + error.message
                });
                return;
            }
        }
    }
    next();
};

/**
 * 预处理插件
 * 并执行主体方法
 * @param {Object} module
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Function} next
 */
var handle = function(module, request, response, config, next){
    var plugList = module.plug,
        filter = module.filter,
        handle = module.handle;

    if(!handle)
        return next();

    var method = {};
    var handList = [];
    if(plugList){
        var i, ilen, j, jlen, obj, me;
        for(i=0, ilen=plugList.length; i<ilen; i++) {
            obj = plugList[i];
            me = obj.handle;
            if (!(me && me.length))
                me = plug.list(obj.name);
            for (j = 0, jlen = me.length; j < jlen; j++)
                handList.push(plug.get(obj.name, me[j]));

        }
    }

    var main = function(){
        handle(request, response, method);
    };
    var plugNext = function(){
        var plugItem = handList.shift();
        if(plugItem)
            plugItem(request, response, method, plugNext);
        else{
            if(filter)
                filter(request, response, method, main);
            else
                handle(request, response, method);
        }

    };
    plugNext();
};