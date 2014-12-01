

module.exports = function(request, response, info){
    var html = "";

    html += "\
    <!DOCTYPE HTML>\
    <html>\
    <head>\
      <meta charset=\"utf-8\">\
      <title>" + info.title + "</title>\
    </head>\
    <body>\
    " + info.state + "\
    </body>\
    </html>\
    ";
    response.end(html);
};