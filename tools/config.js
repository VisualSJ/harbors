const fs = require("fs");
const path = require("path");
const print = require("../server/lib/print");

const support = {
    files: [
        "config.js",
        "option.js",
        "options.js"
    ]
};

const dc = require("../example/config");

/**
 * 根据输入的目录或者文件名字读取出内部的配置
 * According pathDir to read out configuration
 * @param {string} pathDir
 * @returns {*}
 */
exports.read = function(pathDir){
    var realPath, stat;

    if(!fs.existsSync(pathDir)){
        print.error("file / dir does not exist",[
            pathDir
        ]);
        return;
    }

    stat = fs.statSync(pathDir);

    try{
        if(stat.isDirectory()){
            var mark = support.files.length;
            while(mark-- !== 0){
                realPath = path.join(pathDir, support.files[mark]);
                if(fs.existsSync(realPath)){
                    return require(realPath);
                }
            }

            return {};
        }else{
            try{
                return require(pathDir);
            }catch(error){
                return require(path.join(process.cwd(), pathDir));
            }
        }
    }catch(error){
        print.error("The file is not a standard module",[
            realPath || pathDir
        ]);
    }
};

/**
 * 填充补全传入的配置对象
 * Filling complete incoming configuration object
 * @param {object} cc
 * return {object}
 */
exports.fill = function(cc){

    var copy = function(a, b){
        for(var p in b){
            if(Array.isArray(b[p])){
                if(!a[p])
                    a[p] = [];
                copy(a[p], b[p]);
            }else if(typeof b[p] === "object" && b[p] != null){
                if(!a[p])
                    a[p] = {};
                copy(a[p], b[p]);
            }else{
                if(!a[p])
                    a[p] = b[p];
            }
        }
    };

    copy(cc, dc);

    return cc;
};

/**
 * 分离虚拟主机配置
 * 生成一个数组，为每个虚拟主机都生成一份自己的配置
 * The separation of the virtual host configuration
 * to generate an array, we produce an own configuration for each virtual host
 * @param cc
 * @returns {*}
 */
exports.separation = function(cc){
    var result = [];
    var vhost = cc.vhost;
    if(vhost === undefined)
        vhost = [];
    if(!Array.isArray(vhost)){
        print.error("Virtual host configuration is not recognized");
        return null;
    }

    if(vhost.length === 0)
        vhost.push(cc.default);

    vhost.forEach(function(host, index){
        result[index] = JSON.parse( JSON.stringify( cc.default ) );
        for(var p in host){
            result[index][p] = host[p];
        }
        if(!result[index].dir){
            result[index].dir = process.cwd();
        }
    });

    return result;
};

/**
 *
 * @param option
 */
exports.extraction = function(option){

    var Port, Matching;

    var listen = [];

    option.forEach(function(host, index){

        Port = host.port;

        if(Port === undefined){
            print.warn("The host (" + index + ") is not set the port monitor",[
                "IP     : " + host.ip,
                "DOMAIN : " + host.domain,
                "DIR    : " + host.dir
            ]);
            return;
        }

        if(!Array.isArray(Port)){
            Port = [Port];
        }

        Port.forEach(function(port){
            Matching = false;
            for(var i= 0, len=listen.length; i<len; i++){
                if(listen[i].port == port && listen[i].ip == host.ip){
                    listen[i].hostNum.push(index);
                    Matching = true;
                    break;
                }
            }
            if(Matching === false)
                listen.push({
                    port: port,
                    ip: host.ip,
                    hostNum: [index]
                });
        });
    });

    return listen;
};