var http = require("http");

exports.createServer = function(listen){

    listen.forEach(function(op){
//        op.server = http.createServer().listen(op.port, op.ip);
    });

};