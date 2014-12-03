/**
 * 返回一个简单的说明页面
 * @param request
 * @param response
 * @param info
 */
module.exports = function(request, response, info){
    response.writeHead(info.state);
    var html = '\
    <!DOCTYPE html>\
        <html>\
        <head lang="en">\
            <meta charset="UTF-8">\
                <title>' + info.title + '</title>\
                <style>\
                h1,h4,p{font-family:"微软雅黑";}\
                h1{font-size:30px;color:#333;}\
                h4{margin: 5px 30px;color:#999;font-size:14px;}\
                p{font-size:18px;color:#666;padding: 0 0 0 20px;}\
                footer,section{max-width:920px;margin:0 auto;padding:10px 20px;}\
                footer{border-top:1px solid #999;}\
                </style>\
            </head>\
            <body>\
                <section>\
                    <h1>' + info.state + '</h1>\
                    ' + text(info.text) + '\
                </section>\
                <footer>\
                    <h4>HARBORS / 0.5.0 alpha</h4>\
                </footer>\
            </body>\
        </html>\
    ';
    response.end(html);
};

/**
 * 拼接说明文字
 * @param text
 * @returns {string}
 */
var text = function(text){
    var array = text.split("\n");
    text = "";
    array.forEach(function(line){
        text += "<p>" + line + "</p>"
    });
    return text;
};