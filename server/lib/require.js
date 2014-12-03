const fs = require("fs");
const path = require("path");
const plug = require("./plug");
const infoPage = require("./infoPage");

/**
 * 找到指定的动态模块
 * 并且传递给handle方法
 * @param request
 * @param response
 * @param config
 * @param next
 * @returns {*}
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
    if(index !== -1){
        url = url.substr(0, index);
    }

    if(/\/$/.test(url))
        url += "index";

    var address = path.join(dir, url);
    var fileName, timer;
    for(var p in list){
        fileName = address + list[p].extName;
        var timeout = list[p].timeout;
        if(fs.existsSync(fileName)){
            try{
                timer = setTimeout(function(){
                    infoPage(request, response, {
                        state: "500",
                        title: "Internal error",
                        text: "The request timeout.\nPlease check and try again."
                    });
                }, timeout);
                return handle(require(fileName), request, response, list[p], function(){
                    clearTimeout(timer);
                    next();
                });
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
 * @param module
 * @param request
 * @param response
 * @param config
 * @param next
 * @returns {*}
 */
var handle = function(module, request, response, config, next){
    var plugList = module.plug,
        filter = module.filter,
        handle = module.handle;

    if(!handle)
        return next();

    var method = {};
    var handList = [];
    if(plugList)
        plugList.forEach(function(obj){
            obj.handle.forEach(function(f){
                handList.push(plug.get(obj.name, f));
            });
        });

    var main = function(){
        handle(request, response, method);
    };
    var plugNext = function(){
        var p = handList.shift();
        if(p)
            p(request, response, method, plugNext);
        else{
            if(filter)
                filter(request, response, method, main);
            else
                handle(request, response, method);
        }

    };
    plugNext();
};