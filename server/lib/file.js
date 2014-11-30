const fs = require("fs");
const path = require("path");

const mime = require("./mime");

var sendFile = function(response, request, address, expires){

    var fileStat = fs.statSync(address);
    var lastModified = fileStat.mtime.toUTCString();
    var ifModifiedSince = "If-Modified-Since".toLowerCase();

    var extname = path.extname(address);

    if(mime[extname]){
        response.setHeader("Content-Type", mime[extname]);
    }

    if(expires){
        var time = new Date();
        time.setTime(time.getTime() + expires);
        response.setHeader("Expires", time.toUTCString());
        response.setHeader("max-age", expires);
    }

    if(lastModified == request.headers[ifModifiedSince]){
        response.writeHeader(304);
        response.end();
    }else{
        response.setHeader("Last-Modified", lastModified);
        response.end(fs.readFileSync(address));
    }
};

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
        url = request.url,
        expires = config.cache.expires;

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
                    sendFile(response, request, ff, expires);
                    return true;
                }
            }
            return false;
        }else{
            sendFile(response, request, address, expires);
            return true;
        }
    }else{
        return false;
    }

};