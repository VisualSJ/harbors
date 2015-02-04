var style = {
    none       : "\x1B[0m",

    underlined : "\x1B[4m",//下划线

    blackWhite : "\x1B[7m",//白底黑字
    whiteRed   : "\x1B[41m",//红底白字
    whiteGreen : "\x1B[42m",//绿底白字
    whiteYellow: "\x1B[43m",//黄底白字
    whiteBlue  : "\x1B[44m",//蓝底白字
    whiteViolet: "\x1B[45m",//紫底白字
    whiteCyan  : "\x1B[46m",//青底白字
    whiteWhite : "\x1B[47m",//白底白字

    white      : "\x1B[1m",//亮白
    black      : "\x1B[30m",
    red        : "\x1B[31m",
    green      : "\x1B[32m",
    yellow     : "\x1B[33m",
    blue       : "\x1B[34m",
    violet     : "\x1B[35m",//紫色
    cyan       : "\x1B[36m",//青色
    grey       : "\x1B[90m",//灰色
    orange     : "\x1B[91m",//橘黄色
    reseda     : "\x1B[92m",//浅绿色
    popcorn    : "\x1B[93m",//淡黄色
    mulberry   : "\x1B[94m",//暗紫色
    pink       : "\x1B[95m",//粉红色
    nattierblue: "\x1B[96m"//淡青色
};

exports.info = function(message, info){
    console.log(style.none);
    console.log("  info : %s", message);
    if(info && Array.isArray(info)){
        console.log("");
        info.forEach(function(text){
            console.log("    %s", text);
        });
    }
    console.log(style.none);
};

exports.warn = function(message, info){
    console.log(style.popcorn);
    console.log("  info : %s", message);
    if(info && Array.isArray(info)){
        info.forEach(function(text){
            console.log("    %s", text);
        });
    }
    console.log(style.none);
};

exports.error = function(message, info){
    console.log(style.red);
    console.log("  info : %s", message);
    if(info && Array.isArray(info)){
        info.forEach(function(text){
            console.log("    %s", text);
        });
    }
    console.log(style.none);
};