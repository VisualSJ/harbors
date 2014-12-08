var multiparty = require("multiparty");

exports.name = "param";

exports.default = [
    "GET",
    "POST"
];

var GET = function(request, response, method, callback){
    var result = {};
    var paramArr = request.url.split("?");
    if(paramArr && paramArr[1]){
        paramArr = paramArr[1].split("&");
        paramArr.forEach(function(p){
            var t = p.split("=");
            result[t[0]] = t[1];
        });
    }
    method.GET = function(name){
        return name ? result[name] : result;
    };
    callback();
};

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

exports.define = {
    GET: GET,
    POST: POST
};