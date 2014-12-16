var multiparty = require("multiparty");

/**
 * 插件名字
 * @type {string}
 */
exports.name = "param";

/**
 * 默认加载列表
 * @type {string[]}
 */
exports.default = [
    "GET",
    "POST"
];

/**
 * 处理链接上的GET参数，并且定义GET方法
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 * @param {Function} callback
 */
var sp_ex = /([^\?\&]*)\=([^\?\&]*)/g;
var GET = function(request, response, method, callback){
    method.param = method.param || {};
    var result = {};
    var paramArr = request.url.match(sp_ex);
    if(paramArr){
        var t;
        for(var i=paramArr.length-1; i>=0; i--){
            t = paramArr[i].split("=");
            result[t[0]] = t[1];
        }
    }
    method.param.GET = function(name){
        return name ? result[name] : result;
    };
    callback();
};

/**
 * 处理POST参数以及POST文件
 * 并定义POST获取方法
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 * @param {Function} callback
 */
var POST = function(request, response, method, callback){
    method.param = method.param || {};

    if(request.method === 'POST'){
        var form = new multiparty.Form();
        form.parse(request, function(err, fields, files) {
            method.param.POST = function(name){
                if(!name)
                    return fields;
                else{
                    return (fields && fields[name]) || (files && files[name]);
                }
            };
            callback();
        });
    }else{
        method.param.POST = function(){};
        callback();
    }
};

/**
 * 对外暴露的插件方法
 * @type {Object}
 */
exports.define = {
    GET: GET,
    POST: POST
};