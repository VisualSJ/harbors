const fs = require("fs");
const path = require("path");
const plug = require("./plug");
const infoPage = require("./infoPage");

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
    var fileName;
    for(var p in list){
        fileName = address + list[p].extName;
        if(fs.existsSync(fileName)){
            try{
                return handle(require(fileName), request, response, list[p], next);
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