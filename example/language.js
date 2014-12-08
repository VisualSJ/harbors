exports.plug = [
    {name: "param", handle: ["get", "post"]}
];

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

exports.handle = function(request, response, method){
    var result;
    switch(method.get("type")){
        case "zh":
            result = language.zh;
            break;
        default: //en
            result = language.en;
    }
    response.end(JSON.stringify(result));
};