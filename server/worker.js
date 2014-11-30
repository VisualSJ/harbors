const handle = require("./handle");

//  虚拟主机列表
exports.vhost = null;
//  需要监听的队列列表
exports.listen = null;

/**
 * 子进程开始监听主进程的命令
 */
exports.listen = function(){

    process.on("message", function(a, b){
        var controller, object;
        if(!a){
            console.log("");
            console.error("  error : The process of receiving command error");
            console.log("");
            return;
        }else if(!b){
            controller = a.controller;
            delete a.controller;
            object = a;
        }else{
            controller = a;
            object = b;
        }
        var list = handle[controller];
        if(typeof list === "function")
            list(object.result);
        else{
            console.log("");
            console.error("  error : The process could not identify command");
            console.log("");
        }
    });
};