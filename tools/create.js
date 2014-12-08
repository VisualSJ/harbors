const fs = require("fs");
const path = require("path");
const print = require("../server/lib/print");

exports.path = function(address, dir){

    if(typeof address === "boolean")
        address = "site";

    address = path.join(dir, address);

    try{
        cycleDir(address);
        print.info("create - " + address);
        copyFile(address);
    }catch(error){
        print.error(error.message);
    }
};

var Limit = 10;
var cycleDir = function(address){
    var prevDir = path.dirname(address);
    if(!fs.existsSync(prevDir) && Limit-- > 0)
        cycleDir(prevDir);
    fs.mkdirSync(address);
};

var copyFile = function(dir){
    var config = fs.readFileSync(
        path.join(__dirname, "../example/config.js")
    ) + "";
    var staticDir = path.join(dir, "static").replace(/\\/g, "\\\\"),
        controllerDir = path.join(dir, "controller").replace(/\\/g, "\\\\"),
        plugDir = path.join(dir, "plug").replace(/\\/g, "\\\\");

    config = config.replace(/(dir *\: *)\"\"/, function(str, a){
        return a + '"' + staticDir + '"';
    });
    config = config.replace(/(controllerDir *\: *)\"\"/, function(str, a){
        return a + '"' + controllerDir + '"';
    });
    config = config.replace(/(plugDir *\: *)\"\"/, function(str, a){
        return a + '"' + plugDir + '"';
    });
    fs.writeFileSync(
        path.join(dir, "config.js"),
        config
    );

    //创建上述的三个文件夹
    fs.mkdirSync(staticDir);
    fs.mkdirSync(controllerDir);
    fs.mkdirSync(plugDir);

    //创建文件夹内的文件
    var readable = fs.createReadStream( path.join(__dirname, "../example/index.html") );
    var writable = fs.createWriteStream( path.join(staticDir, "index.html") );
    readable.pipe( writable );
    readable = fs.createReadStream( path.join(__dirname, "../example/language.js") );
    writable = fs.createWriteStream( path.join(controllerDir, "language.js") );
    readable.pipe( writable );
    readable = fs.createReadStream( path.join(__dirname, "../example/example.js") );
    writable = fs.createWriteStream( path.join(plugDir, "example.js") );
    readable.pipe( writable );
};