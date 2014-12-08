//插件的名字
//必须定义, 否则将无法加载到这个插件对象
exports.name = "example";

//如果没有定义引用该插件的什么方法, 则会取这里的列表全部加载
exports.default = [
    "example"
];

//处理的部分
var h = function(request, response, method, callback){
    //处理逻辑
    //......

    //传递一个方法出去(这个method会一直传递到控制器的handle里面)
    //控制器里执行method.example其实就会执行到这里的方法
    method.example = function(){
        response.end("example");
    };

    //处理结束后执行callback, 传递运行权限
    callback();
};

//这里定义的是这个插件内的每个方法
//以便在handle数组里定义需要预处理哪个方法
exports.define = {
    example: h
};