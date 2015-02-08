var net = require("net");
var sys = require("sys");
var path = require("path");

/**
 * 找到指定的动态模块
 * 并且传递给CGI进程
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Function} next
 */
module.exports = function(request, response, config, next){
    if(!config)
        return next();

    var dir = config.controllerDir,
        list = config.fastCGI,
        url = request.url;

    if(!dir || !url)
        return next();

    for(var i=0; i<list.length; i++){
        if(!list[i].RegExp)
            list[i].RegExp = new RegExp(list[i].extName + "$");
        if(list[i].RegExp.test(url)){

            var connection = new net.Stream();
            connection.setNoDelay(true);

            connection.addListener("error", function(err) {
                sys.puts(sys.inspect(err.stack));
                connection.end();
            });
            connection.on("connect", function(){
                connect(request, response, config, connection);
            });
            connection.addListener("close", function() {
                response.end();
                connection.end();
            });
            connection.on("end", function(){
                response.end();
                connection.end();
            });

            var dataHeader = null;
            connection.on("data",  function(chunk, start, end){
                if(!dataHeader){
                    dataHeader ={};
                    parseHeader(chunk, start, end, dataHeader);
                    start += 8;
                }

                response.write(parseData(chunk, start, end, response));

            });

            connection.connect("9123", "127.0.0.1");
            return;
        }
    }
    next();
};

var makeHeaders = function(headers, params) {
    if (headers.length <= 0) {
        return params;
    }

    for (var prop in headers) {
        var head = headers[prop];
        prop = prop.replace(/-/, '_').toUpperCase();
        if (prop.indexOf('CONTENT_') < 0) {
            // Quick hack for PHP, might be more or less headers.
            prop = 'HTTP_' + prop;
        }
        params[params.length] = [prop, head || '']
    }
    return params;
};

var getParamLength = function(params) {
    var size = 0;
    params.forEach(function(param) {
        size += (param[0].length + param[1].toString().length);
        if(param[0].length > 127) {
            size += 4;
        } else {
            size++;
        }
        if(param[1].toString().length > 127) {
            size += 4;
        } else {
            size++;
        }
    });
    return size;
};

var FCGI_MAX_BODY = Math.pow(2, 16);
var FCGI_MAX_HEAD = 8;

var connect = function(request, response, config, connection){

    var script_dir = config.controllerDir;
    var script_file = "/index.php";
    var file_address = path.join(script_dir,script_file);
    var qs = '';
    var params = makeHeaders(request.headers, [
        ["SCRIPT_FILENAME", file_address],
        ["REMOTE_ADDR",request.connection.remoteAddress || ''],
        ["QUERY_STRING", qs],
        ["REQUEST_METHOD", request.method],
        ["SCRIPT_NAME", script_file],
        ["PATH_INFO", request.url.split('?')[0]],
        ["DOCUMENT_URI", script_file],
        ["REQUEST_URI", request.url.split('?')[0]],
        ["DOCUMENT_ROOT", script_dir],
        ["PHP_SELF", file_address],
        ["GATEWAY_PROTOCOL", "CGI/1.1"],
        ["SERVER_SOFTWARE", "Harbors"]
    ]);

    var buffer = new Buffer(FCGI_MAX_BODY + FCGI_MAX_HEAD);
    var header = {
        "version": 1,
        "type": 1,
        "recordId": 0,
        "contentLength": 0,
        "paddingLength": 0
    };

    var begin = {
        "role": 1,
        "flags": 0
    };

    var len = 0;

    //发送协议头
    header.type = 1;
    header.contentLength = 8;
    writeBegin(buffer, begin, writeHeader(buffer, header));
    len = header.contentLength + header.paddingLength + FCGI_MAX_HEAD;
    connection.write(buffer.slice(0,  len));

    //发送协议内容(参数字段)
    header.type = 4;
    header.contentLength = getParamLength(params);
    len = header.contentLength + header.paddingLength + FCGI_MAX_HEAD;
    writeParams(buffer, params, writeHeader(buffer, header));
    connection.write(buffer.slice(0,  len));

    //发送参数字段结束符号
    header.type = 4;
    header.contentLength = 0;
    len = header.contentLength + header.paddingLength + FCGI_MAX_HEAD;
    writeHeader(buffer, header);
    connection.write(buffer.slice(0,  len));

    request.on('data', function(chunk) {
        header.type = 5;
        header.contentLength = chunk.length;
        header.paddingLength = 0;
        len = header.contentLength + header.paddingLength + FCGI_MAX_HEAD;
        writeHeader(buffer, header);
        chunk.copy(buffer, len);
        len += chunk.length;
        connection.write(buffer.slice(0,  len));
    });

    request.on('end', function(){
        header.type = 5;
        header.contentLength = 0;
        header.paddingLength = 0;
        len = header.contentLength + header.paddingLength + FCGI_MAX_HEAD;
        writeHeader(buffer, header);
        connection.write(buffer.slice(0,  len));
        connection.end();
    });

};

var writeHeader = function(buffer, header){
    var i = 0;
    buffer[i++] = header.version & 0xff;
    buffer[i++] = header.type & 0xff;
    buffer[i++] = (header.recordId >> 8) & 0xff;
    buffer[i++] = header.recordId & 0xff;
    buffer[i++] = (header.contentLength >> 8) & 0xff;
    buffer[i++] = header.contentLength & 0xff;
    buffer[i++] = header.paddingLength & 0xff;
    buffer[i++] = 0;
    return i;
};

var writeBegin = function(buffer, begin, index) {
    var i = index;
    buffer[i++] = (begin.role >> 8) & 0xff;
    buffer[i++] = begin.role & 0xff;
    buffer[i++] = begin.flags & 0xff;
    buffer[i++] = 0;
    buffer[i++] = 0;
    buffer[i++] = 0;
    buffer[i++] = 0;
    buffer[i++] = 0;
    return i;
};

var writeParams = function(buffer, params, index) {
    var i = index;
    var plen = params.length;
    index = 0;
    // loop optimisation
    while(plen--) {
        var param = params[index++];
        var name = param[0];
        var value = param[1].toString();
        var nlen = name.length;
        var vlen = value.length;
        if(nlen > 127) {
            var nlen1 = nlen | 0x80000000;
            buffer[i++] = (nlen1 >> 24) & 0xff;
            buffer[i++] = (nlen1 >> 16) & 0xff;
            buffer[i++] = (nlen1 >> 8) & 0xff;
            buffer[i++] = nlen1 & 0xff;
        }
        else {
            buffer[i++] = nlen & 0xff;
        }
        if(vlen > 127) {
            var vlen1 = vlen | 0x80000000;
            buffer[i++] = (vlen1 >> 24) & 0xff;
            buffer[i++] = (vlen1 >> 16) & 0xff;
            buffer[i++] = (vlen1 >> 8) & 0xff;
            buffer[i++] = vlen1 & 0xff;
        }
        else {
            buffer[i++] = vlen & 0xff;
        }
        //buffer.write(name + value, i, "ascii");
        buffer.asciiWrite(name + value, i, nlen + vlen);
        i += (nlen + vlen);
    }
    return i;
};


var parseHeader = function(buffer, start, end, header){
    start = start || 0;
    header.version = buffer[start];
    header.type = buffer[start + 1];
    header.recordId = (buffer[start + 2] << 8) + buffer[start + 3];
    header.contentLength = (buffer[start + 4] << 8) + buffer[start + 5];
    header.paddingLength = buffer[start + 6];
};

var parseData = function(buffer, start, end, respone){
    start = start || 0;
    end = end || buffer.length;
    if(
        buffer[start] === 1 &&
        buffer[start + 1] === 6 &&
        buffer[start + 2] === 0 &&
        buffer[start + 3] === 0 &&
        buffer[start + 4] === 0 &&
        buffer[start + 5] === 67 &&
        buffer[start + 6] === 5 &&
        buffer[start + 7] === 0
    ){
        for(var i=start; i<end; i++){
            if(
                buffer[i] === 1 &&
                buffer[i + 1] === 6 &&
                buffer[i + 2] === 0 &&
                buffer[i + 3] === 0 &&
                buffer[i + 4] === 255 &&
                buffer[i + 5] === 248 &&
                buffer[i + 6] === 0 &&
                buffer[i + 7] === 0
            ){
                start += 8;
                var headers = buffer.slice(start, i - start) + '';
                headers = headers.split("\r\n");
                headers.forEach(function(head){
                    head = head.split(/\:\s*/);
                    respone.setHeader(head[0], head[1]);
                });
                start += i;
            }
        }
    }
    return buffer.slice(start, end - start);
};