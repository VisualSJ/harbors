/**
 * cookie插件名
 * @type {string}
 */
exports.name = "cookie";

exports.default = [
    "GET",
    "SET"
];

var get_ex = /\S+\=[^;]+/;
/**
 * 解析获取cookie
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 * @param {Function} callback
 */
var GET = function(request, response, method, callback){
    method.cookie = method.cookie || {};
    var result = {};
    var cookie = request.headers.cookie;
    if(cookie){
        cookie = cookie.match(get_ex);
        cookie.forEach(function(item){
            item = item.split("=");
            result[item[0]] = item[1];
        });
    }
    method.cookie.GET = function(name){
        return name ? result[name] : result;
    };
    callback();
};

/**
 * 设置cookie
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 * @param {Function} callback
 */
var SET = function(request, response, method, callback){
    method.cookie = method.cookie || {};

    method.cookie.SET = function(name, value, expires, path, domain){
        var cookie = response.getHeader("Set-Cookie") || [];
        if(Array.isArray(cookie))
            cookie = [cookie];

        var cookieStr = name + '=' + value + ';';

        //cookie有效期时间
        if (expires != undefined) {
            expires = parseInt(expires);
            var today = new Date();
            var time = today.getTime() + expires * 1000;
            var new_date = new Date(time);
            var expiresDate = new_date.toGMTString(); //转换成 GMT 格式。
            cookieStr += 'expires=' +  expiresDate + ';';
        }
        //目录
        if (path != undefined) {
            cookieStr += 'path=' +  path + ';';
        }
        //域名
        if (domain != undefined) {
            cookieStr += 'domain=' +  domain + ';';
        }

        cookie.push(cookieStr);
        response.setHeader("Set-Cookie", cookie);

    };
    callback();
};

/**
 * 定义暴露出去的方法列表
 * @type {{GET: GET, SET: SET}}
 */
exports.define = {
    GET: GET,
    SET: SET
};