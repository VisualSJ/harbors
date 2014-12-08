exports.config = {
    //进程数量
    process: 1,
    //自动加载的插件目录
    plugDir: ""
};

exports.default = {
    dir: "",//静态文件地址, 默认为运行文件夹下
    controllerDir: "",//动态接口文件地址, 默认为运行文件夹下(和dir目录一样的话,文件会优先返回成静态文件!)
    file: ["index.html"],//默认返回文件
    port: [3000],//端口
    ip: null,//绑定服务器的ip
    domain: "*",//绑定服务器的域名
    session: {
        id: "HsessID",
        expires: 3600000

    },
    cache: {
        //客户端缓存的过期时间
        expires: 30000,
        //动态接口的静态缓存
        dynamic: 0,
        //缓存大小
        maximum: 5 * 1024 * 1024
    },
    zip: {
        file: []
    },
    log: {
        dir: null,
        size: 1024 * 10
    },
    fastCGI: [
        {
            //注册一个通过fastCGI通讯的文件类
            extName: ".php",
            host: "127.0.0.1",
            port: 9000
        }
    ],
    require: [
        {
            //注册一个通过require引入的文件类
            extName: ".js",
            autoReload: true,
            timeout: 10000
        }
    ]
};

exports.vhost = [];