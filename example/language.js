/**
 * 定义这个控制器需要预处理什么插件
 *   name   - 插件名
 *   handle - 插件内需要处理的方法名(数组)
 * @type {{name: string, handle: string[]}[]}
 */
exports.plug = [
    {name: "param", handle: ["GET", "POST"]}
];

/**
 * 控制器过滤器, 可以用来判断过滤条件, next传递处理权限
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 * @param {Function} next
 */
exports.filter = function(request, response, method, next){
    next();
};

var language = {
    zh: {
        title: "欢迎使用Harbors",
        info: [
            "在使用中如果遇到问题，或者需要帮助，请留言:",
            "<a target='_blank'  href='https://github.com/VisualSJ/harbors/issues'>&emsp;&emsp;https://github.com/VisualSJ/harbors/issues</a>"
        ]
    },
    en: {
        title: "Welcome to Harbors",
        info: [
            "In use, if you encounter a problem, or need help, please leave a message:",
            "<a target='_blank' href='https://github.com/VisualSJ/harbors/issues'>&emsp;&emsp;https://github.com/VisualSJ/harbors/issues</a>"
        ]
    }
};

/**
 * 控制器内的处理函数
 * Harbors将处理权限抛给这里后, 就不再管理这个链接的具体逻辑
 * @param {Object} request
 * @param {Object} response
 * @param {Object} method
 */
exports.handle = function(request, response, method){
    var result;
    switch(method.GET("type")){
        case "zh":
            result = language.zh;
            break;
        default: //en
            result = language.en;
    }
    response.end(JSON.stringify(result));
};