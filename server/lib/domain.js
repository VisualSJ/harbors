const print = require("./print");

var worker = require("../worker");
var domain2host = {};

/**
 * 根据传入的url，返回上一级地址
 *   www.itharbors.com -> *.itharbors.com
 *   *.itharbors.com   -> *.com
 *   *.com             -> *
 * @param {String} domain
 * @returns {XML|string|void}
 */
var backURL = function(domain){
    return domain.replace(/^(\*\.[^\.]*|[^\.]*)/, '*');
};

/**
 * 匹配虚拟主机
 * @param {Array} list 虚拟主机列表
 * @param {String} domain 请求的域名
 * @returns {Object}
 */
var match = function(list, domain){
    var host;
    var wHost = worker.vhost;
    for(var i = 0, len = list.length; i < len; i++){
        host = wHost[list[i]];
        if(host.domain === domain){
            return host;
        }
    }
    var nextDomain = backURL(domain);
    if(nextDomain === domain){
        print.warn("domain is not found");
        return;
    }
    return match(list, nextDomain);
};

/**
 * 传入一个域名
 * 在worker的vhost中寻找对应的配置参数
 * @param {String} domain
 * @param {Array} list
 */
module.exports = function(domain, list){
    if(domain2host[domain]){
        //在缓存队列中寻找对应的配置
        return domain2host[domain];
    }else{
        //缓存不存在，在整个队列里寻找
        return domain2host[domain] = match(list, domain)
    }
};