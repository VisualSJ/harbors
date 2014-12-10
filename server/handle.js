const http = require("http");
const domain = require("./lib/domain");
const file = require("./lib/file");
const requireFile = require("./lib/require");
const infoPage = require("./lib/infoPage");
const plug = require("./lib/plug");
const print = require("./lib/print");

var worker = require("./worker");

/**
 * 接收虚拟主机列表
 * @param {Object} vhost
 */
exports.VHOST = function(vhost){
    worker.vhost = JSON.parse(vhost);
};

/**
 * 导入自定义的plug插件
 */
exports.IMPORTPLUG = plug.import;

var handleList = [
    file,
    requireFile
];
/**
 * 开启一个服务器
 * @param {Object} host - port, ip, host num
 */
exports.START = function(host){
    host = JSON.parse(host);

    print.info(
            "PID#"+(process.pid)+
            " start listen - "+(host["port"])+
            " | "+(host["ip"] || "not bind ip"));

    var end = function(request, response){
        infoPage(request, response, {
            state: "404",
            title: "not found",
            text: "You have to find the page does not exist.\nPlease make sure the address is correct.\nOr,Check for and resolve those errors by contacting the server administrator."
        });
    };

    var hostList = host.hostNum;
    http.createServer(function(request, response){


        //设置默认头部
        response.setHeader("Server", "Harbors");
        response.setHeader("Content-Type", "text/html;charset=utf8");

        //如果没有访问的headers，则视为非法访问
        if(!(request.headers && request.headers.host))
            return end(request, response);

        //获取对应虚拟主机的配置文件
        var config = domain(request.headers.host, hostList);

        var index = -1;
        var next = function(){
            index++;
            if(handleList[index])
                handleList[index](request, response, config, next);
            else
                end(request, response);
        };
        next();

    }).listen(host.port, host.ip);
};