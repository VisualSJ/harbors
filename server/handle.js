const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const domain = require("./lib/domain");
const file = require("./lib/file");
const requireFile = require("./lib/require");
const fastCGI = require("./lib/fastCGI");
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
        var remoteUrl = (request.headers.host+"").split(":")[0];
        var config = domain(remoteUrl, hostList);
        if(!config){
            print.warn("domain is not found:", [
                "Remote address: " + getClientIp(request),
                "Host: " + remoteUrl,
                "Url: " + request.url,
                "Date: " + (new Date() - 0)
            ]);
            return end(request, response);
        }

        if(!config)
            return end(request, response);

        //是否允许来源页面的跨域访问
        if(config.accessOrigin)
            response.setHeader("Access-Control-Allow-Origin", "*");

        //解析url地址以及GET参数
        var urlObject;
        if(request.url)
            urlObject = url.parse(request.url);
        else
            urlObject = {
                protocol: null,
                slashes: null,
                auth: null,
                host: null,
                port: null,
                hostname: null,
                hash: null,
                search: '',
                query: '',
                pathname: '',
                path: '',
                href: ''
            };

        var isDir = /\/$/.test(urlObject.pathname);
        var tPath, tUrl, i;

        //匹配每个重写规则
        if(config.rewrite && config.rewrite.length > 0){
            config.rewrite.forEach(function(item){
                if(item.regular === undefined)
                    item.regular = new RegExp(item.condition);
                urlObject.pathname = urlObject.pathname.replace(item.regular, item.result)
            });
        }

        //判断路径是否需要添加默认的访问文件，并且尝试返回动态文件
        if(isDir){
            if(config.file){
                for(i=0; i<config.file.length; i++){
                    tUrl = url.resolve(urlObject.pathname, config.file[i]);
                    tPath = path.join(config.controllerDir, tUrl);
                    if(fs.existsSync(tPath)){
                        urlObject.pathname = tUrl;
                        urlObject.actual = tPath;
                        if(getHandle(request, response, config, urlObject)){
                            return;
                        }
                    }
                }
            }
        }else{
            urlObject.actual = path.join(config.controllerDir, urlObject.pathname);
            if(fs.existsSync(urlObject.actual)) {
                if(getHandle(request, response, config, urlObject)){
                    return;
                }
            }
        }

        //静态文件
        if(isDir){
            if(config.file){
                for(i=0; i<config.file.length; i++){
                    tUrl = url.resolve(urlObject.pathname, config.file[i]);
                    tPath = path.join(config.dir, tUrl);
                    if(fs.existsSync(tPath)){
                        urlObject.pathname = tUrl;
                        urlObject.actual = tPath;
                        file(request, response, config, urlObject);
                        return;
                    }
                }
            }
        }else{
            urlObject.actual = path.join(config.dir, urlObject.pathname);
            if(fs.existsSync(urlObject.actual)) {
                file(request, response, config, urlObject);
                return;
            }
        }

        end(request, response);

    }).listen(host.port, host.ip);
};

var getHandle = function(request, response, config, urlObject){
    var i, list, item;

    //nodejs 模块
    i = 0;
    list = config.require;
    for(i; i< list.length; i++){
        item = list[i];
        if(urlObject.actual.indexOf(item.extName) > -1){
            requireFile.send(request, response, config, item, urlObject);
            return true;
        }
    }

    //fastCGI模块
    i = 0;
    list = config.fastCGI;
    for(i; i< list.length; i++){
        item = list[i];
        if(urlObject.actual.indexOf(item.extName) > -1){
            fastCGI.send(request, response, config, item, urlObject);
            return true;
        }
    }
    return false;
};

function getClientIp(request) {
    if(request.headers && request.headers['x-forwarded-for'])
        return request.headers['x-forwarded-for'];
    if(request.connection){
        if(request.connection.remoteAddress)
            return request.connection.remoteAddress;
        if(request.connection.socket && request.connection.socket.remoteAddress)
            return request.connection.socket.remoteAddress;
    }
    if(request.socket && request.socket.remoteAddress)
        return request.socket.remoteAddress;
};