var http = require("http");
var child = require("child_process");

var children;

exports.createChild = function(){
    children = child.fork("./server/child");
};

exports.sendCommand = function(option){

    children.send("test", "");
};

exports.sendHandle = function(listen, host){
    console.log(listen)
    listen.forEach(function(host){
        var tcp = http.createServer();
        tcp.listen(host.port, host.ip, function() {
            children.send("a", tcp._handle);
        });
        //window下结束服务器并不会关闭多余的进程
        //tcp.close();
    });
};