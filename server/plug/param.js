exports.plug = [
    "get",
    "post"
];

exports.get = function(request, response, method, callback){
    var result = {};
    var paramArr = request.url.split("?");
    if(paramArr && paramArr[1]){
        paramArr = paramArr[1].split("&");
        paramArr.forEach(function(p){
            var t = p.split("=");
            result[t[0]] = t[1];
        });
    }
    method.get = function(name){
        return name ? result[name] : result;
    };
    callback();
};

exports.post = function(request, response, method, callback){
    callback();
};