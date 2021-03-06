var net = require("net");
var sys = require("sys");
var path = require("path");

/**
 * 找到指定的动态模块
 * 并且传递给CGI进程
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Object} setting
 * @param {Object} urlObject
 */
exports.send = function(request, response, config, setting, urlObject){

    var connection = new net.Stream();
    connection.setNoDelay(true);

    connection.addListener("error", function(err) {
        sys.puts(sys.inspect(err.stack));
        connection.end();
    });
    connection.on("connect", function(){
        connect(request, response, config, urlObject, connection);
    });
    connection.addListener("close", function() {
        response.end();
        connection.end();
    });
    connection.on("end", function(){
        response.end();
        connection.end();
    });

    var header = {
        contentLength: 0,
        paddingLength: 0
    };
    var firstChunk = true;
    var firstList = [];
    connection.on("data",  function(chunk){
        var start = 0;
        var end = chunk.length;

        if(header.contentLength > 0){
            response.write(chunk.slice(start, start + header.contentLength));
            start += header.contentLength;
            header.contentLength = 0;
        }

        var data;
        while(start < end){

            start += header.paddingLength;
            header.paddingLength = 0;

            parseHeader(chunk, start, end, header);
            start += 8;
            //console.log(header);
            var length = 0;
            switch(header.type){
                case 7:
                    data = chunk.slice(start, start + header.contentLength);
                    length = data.length;
                    break;
                case 6:
                    data = chunk.slice(start, start + header.contentLength);
                    length = data.length;
                    if(firstChunk){
                        data += "";
                        var split = data.indexOf("\r\n\r\n");

                        if(split === -1){
                            firstList.push(data);
                        }else{
                            var sendHeaders = data.substr(0, split).split("\r\n");
                            var status = 200;
                            sendHeaders.forEach(function(string){
                                if(string){
                                    var index = string.indexOf(":");
                                    var name = string.substr(0, index);
                                    var value = string.substr(index+2);
                                    if(name === "Status")
                                        status = parseInt(value);
                                    response.setHeader(name, value);
                                }
                            });
                            response.writeHeader(status);
                            firstList.forEach(function(data){
                                response.write(data);
                            });
                            response.write(data.substr(split+4));
                        }
                        firstChunk = false;
                    }else
                        response.write(data);
                    break;
                case 3:
                    break;
                default:
                    break;
            }
            start += length;
            header.contentLength -= length;
        }
    });

    connection.connect(setting.port, setting.host);
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

var connect = function(request, response, config, urlObject, connection){

    var script_dir = config.controllerDir;
    var script_file = urlObject.pathname;
    if(/(\/|\\)$/.test(script_file))
        script_file += "index.php";

    var file_address = path.join(script_dir,script_file);

    var params = makeHeaders(request.headers, [
        ["SCRIPT_FILENAME", file_address],
        ["REMOTE_ADDR",request.connection.remoteAddress || ''],
        ["QUERY_STRING", urlObject.query || ''],
        ["REQUEST_METHOD", request.method],
        ["SCRIPT_NAME", script_file],
        ["PATH_INFO", urlObject.pathname || ''],
        ["DOCUMENT_URI", script_file],
        ["REQUEST_URI", urlObject.pathname || ''],
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