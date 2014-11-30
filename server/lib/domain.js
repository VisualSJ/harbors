

var worker = require("../worker");
var domain2host = {};

var backURL = function(domain){
    return domain.replace(/^(\*\.[^\.]*|[^\.]*)/, '*');
};

var match = function(list, domain){
    for(var i = 0, len = list.length; i < len; i++){
        if(list[i].domain === domain){
            return list[i];
        }
    }
    var nextDomain = backURL(domain);
    if(nextDomain === domain){
        console.log("");
        console.warn("  warn : domain is not found");
        console.log("");
        console.log("    %s", domain);
        return;
    }
    return match(list, nextDomain);
};

/**
 * 传入一个域名
 * 在worker的vhost中寻找对应的配置参数
 * @param domain
 */
module.exports = function(domain){
    if(domain2host[domain]){
        //在缓存队列中寻找对应的配置
        return domain2host[domain];
    }else{
        //缓存不存在，在整个队列里寻找
        var config = match(worker.vhost, domain);
        if(config)
            domain2host[domain] = config;

        return config;
    }
};