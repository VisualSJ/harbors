const http = require("http");
const domain = require("./lib/domain");
const file = require("./lib/file");
const requireFile = require("./lib/require");
const infoPage = require("./lib/infoPage");

var worker = require("./worker");

/**
 * 接收虚拟主机列表
 * @param vhost
 */
exports.VHOST = function(vhost){
    worker.vhost = JSON.parse(vhost);
};

var handleList = [
    file,
    requireFile
];
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

        var end = function(){
            infoPage(request, response, {
                state: "404",
                title: "not found",
                text: "You have to find the page does not exist.\nPlease make sure the address is correct.\nOr,Check for and resolve those errors by contacting the server administrator."
            });
        };

        //设置默认头部
        response.setHeader("Server", "Harbors");
        response.setHeader("Content-Type", "text/html");

        //获取对应虚拟主机的配置文件
        var config = domain(request.headers.host);

        var index = -1;
        var next = function(){
            index++;
            if(handleList[index])
                handleList[index](request, response, config, next);
            else
                end();
        };
        next();

    }).listen(host.port);
};