const http = require("http");
const domain = require("./lib/domain");
const file = require("./lib/file");
const infoPage = require("./lib/infoPage");

var worker = require("./worker");

/**
 * 接收虚拟主机列表
 * @param vhost
 */
exports.VHOST = function(vhost){
    worker.vhost = JSON.parse(vhost);
};

/**
 * 开启一个服务器
 * @param {object} host - port, ip, host num
 */
exports.START = function(host){
    host = JSON.parse(host);
    console.log(
        "  PID#"+(process.pid)+
        " start listen - "+(host["port"])+
        " | "+(host["ip"] || "not bind ip")
    );
    http.createServer(function(request, response){
        var state;
        var config = domain(request.headers.host);
        response.setHeader("Server", "Harbors");
        response.setHeader("Content-Type", "text/html");

        //静态文件
        state = file(request, response, config);

        if(!state){
            infoPage(request, response, {
                state: "404",
                title: "not found",
                text: ""
            });
        }
    }).listen(host.port);
};