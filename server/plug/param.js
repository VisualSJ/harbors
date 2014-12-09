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
var GET = function(request, response, method, callback){
    var result = {};
    var paramArr = request.url.split("?");
    if(paramArr && paramArr[1]){
        paramArr = paramArr[1].split("&");
        var item;
        for(var i= 0, len=paramArr.length; i<len; i++){
            item = paramArr[i].split("=");
            result[item[0]] = item[1];
        }
    }
    method.GET = function(name){
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

    if(request.method === 'POST'){
        var form = new multiparty.Form();
        form.parse(request, function(err, fields, files) {
            method.POST = function(name){
                if(!name)
                    return fields;
                else{
                    return fields[name] || files[name];
                }
            };
            callback();
        });
    }else{
        method.POST = function(){};
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