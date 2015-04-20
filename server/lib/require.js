const fs = require("fs");
const path = require("path");
const plug = require("./plug");
const infoPage = require("./infoPage");

/**
 * 找到指定的动态模块
 * 并且传递给handle方法
 * @param {Object} request
 * @param {Object} response
 * @param {Object} config
 * @param {Object} item
 * @param {Object} urlObject
 */
exports.send = function(request, response, config, item, urlObject){
    try {
        //读取指定的Nodejs模块，并执行
        var module = require(urlObject.actual);
        handle(module, request, response);
    } catch (error) {
        infoPage(request, response, {
            state: "500",
            title: "Internal error",
            text: "The server has encountered some unexpected during operation.\nPlease check and try again:\n    " + error.message
        });
    }
};

/**
 * 预处理插件
 * 并执行主体方法
 * @param {Object} module
 * @param {Object} request
 * @param {Object} response
 */
var handle = function(module, request, response){
    var plugList = module.plug,
        filter = module.filter,
        handle = module.handle;

    var method = {};//预处理的方法列表
    var handList = [];

    if(plugList){
        var i, ilen, j, jlen, obj, me;
        for(i=0, ilen=plugList.length; i<ilen; i++) {
            obj = plugList[i];
            me = obj.handle;
            if (!(me && me.length))
                me = plug.list(obj.name);
            for (j = 0, jlen = me.length; j < jlen; j++)
                handList.push(plug.get(obj.name, me[j]));

        }
    }

    var main = function(){
        handle(request, response, method);
    };
    var plugNext = function(){
        var plugItem = handList.shift();
        if(plugItem)
            plugItem(request, response, method, plugNext);
        else{
            if(filter)
                filter(request, response, method, main);
            else
                handle(request, response, method);
        }

    };
    plugNext();
};