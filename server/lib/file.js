const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const mime = require("./mime");

/**
 * 返回找到的静态文件
 * 处理过期时间，304状态等
 * @param {Object} response
 * @param {Object} request
 * @param {String} address
 * @param {Number} expires
 * @param {Boolean} zip
 */
var ifModifiedSince = "If-Modified-Since".toLowerCase();
var sendFile = function(response, request, address, expires, zip){

    var fileStat = fs.statSync(address);
    var lastModified = fileStat.mtime.toUTCString();

    var extname = path.extname(address);

    if(mime[extname])
        response.setHeader("Content-Type", mime[extname]);

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
        var buffer = fs.readFileSync(address);

        response.setHeader("Last-Modified", lastModified);
        if(zip && zip.length){

            extname = path.extname(address);
            if(zip.some(function(a){ return a===extname;})){
                var acceptEncoding = request.headers['accept-encoding'];
                if(acceptEncoding && acceptEncoding.indexOf('gzip')>-1){
                    response.setHeader("Content-Encoding", "gzip");
                    zlib.gzip(buffer, function(error, result){
                        if(error) throw error;
                        sendBuffer(response, result.length, result);
                    });
                    return;
                }else if(acceptEncoding && acceptEncoding.indexOf('deflate')>-1){
                    this._header['Content-Encoding'] = 'deflate';
                    harbors.log("Zip module : Deflate");
                    zlib.deflateRaw(string, function(error, result){
                        if(error) throw error;
                        sendBuffer(response, result.length, result);
                    });
                    return;
                }
            }
        }

        sendBuffer(response, buffer.length, buffer);
    }
};

/**
 * 返回buffer
 * @param {Object} response
 * @param {Number} length
 * @param {Buffer} buffer
 */
var sendBuffer = function(response, length, buffer){
    response.setHeader("Content-Length", length);
    response.end(buffer);
};

/**
 * 根据传入的url检索静态文件
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Object} urlObject
 */
module.exports = function(request, response, config, urlObject){
    var expires = config.cache ? config.cache.expires : 0,
        zip = config.zip ? config.zip.file : 0;
    sendFile(response, request, urlObject.actual, expires, zip);
};