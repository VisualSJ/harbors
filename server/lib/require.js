const fs = require("fs");
const path = require("path");
const plug = require("./plug");

module.exports = function(request, response, config){
    if(!config){
        return false;
    }

    var dir = config.controllerDir,
        list = config.require,
        url = request.url;

    if(!dir || !url){
        return false;
    }

    var index = url.indexOf("?");
    if(index !== -1){
        url = url.substr(0, index);
    }

    if(/\/$/.test(url)){
        url += "index";
    }

    var address = path.join(dir, url);
    var fileName;

    for(var p in list){
        fileName = address + list[p].extName;
        if(fs.existsSync(fileName)){
            try{
                return handle(require(fileName), request, response, list[p]);
            }catch(error){
                return false;
            }
        }
    }

    return false;
};

var handle = function(module, request, response, config){
    var plugList = module.plug,
        filter = module.filter,
        handle = module.handle;

    if(!handle){
        return false;
    }

    //todo plug功能
    var method = {};
    var list = plug.createList();
    for(var i=0,len=plugList.length; i<len; i++){
        list.add(plug.get(plugList[i]));
    }
    list.end(function(){

        if(filter){
            filter = filter(request, response, method);
        }else{
            filter = true;
        }

        if(filter){
            return handle(request, response, method);
        }
    });

};