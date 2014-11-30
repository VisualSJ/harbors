const fs = require("fs");
const path = require("path");

/**
 * 检索静态文件
 * @param request
 * @param response
 * @param config
 * @returns {boolean}
 */
module.exports = function(request, response, config){
    var dir = config.dir,
        file = config.file,
        url = request.url;

    var index = url.indexOf("?");
    if(index !== -1){
        url = url.substr(0, index);
    }

    var address = path.join(dir, url);

    var stat;
    //访问的文件夹或文件存在
    if(fs.existsSync(address)){

        stat = fs.statSync(address);

        //访问的是一个文件夹，需要拼接默认文件
        if(stat.isDirectory()){
            var ff;
            for(var i= 0, len = file.length; i < len; i++){
                ff = path.join(address, file[i]);
                if(fs.existsSync(ff)){
                    response.end(fs.readFileSync(ff));
                    return true;
                }
            }
            return false;
        }else{
            response.end(fs.readFileSync(address));
            return true;
        }
    }else{
        return false;
    }

};