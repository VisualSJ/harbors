const fs = require("fs");
const path = require("path");

exports.path = function(address, dir){

    if(typeof address === "boolean")
        address = "site";

    address = path.join(dir, address);

    try{
        cycleDir(address);
        console.log("");
        console.log("  create : %s", address);
        copyFile(address);
    }catch(error){
        showError(error);
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
        controllerDir = path.join(dir, "controller").replace(/\\/g, "\\\\");

    config = config.replace(/(dir *\: *)\"\"/, function(str, a){
        return a + '"' + staticDir + '"';
    });
    config = config.replace(/(controllerDir *\: *)\"\"/, function(str, a){
        return a + '"' + controllerDir + '"';
    });
    fs.writeFileSync(
        path.join(dir, "config.js"),
        config
    );

    //创建上述的两个文件夹
    fs.mkdirSync(staticDir);
    fs.mkdirSync(controllerDir);

    //创建文件夹内的文件
    var readable = fs.createReadStream( path.join(__dirname, "../example/index.html") );
    var writable = fs.createWriteStream( path.join(staticDir, "index.html") );
    readable.pipe( writable );
    readable = fs.createReadStream( path.join(__dirname, "../example/language.js") );
    writable = fs.createWriteStream( path.join(controllerDir, "language.js") );
    readable.pipe( writable );
};

var showError = function(error){
    console.log("");
    console.log(" error : %s", error.message);
    console.log("");
};