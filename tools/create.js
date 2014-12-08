const fs = require("fs");
const path = require("path");

exports.path = function(address, dir){

    if(typeof address === "boolean")
        address = "site";

    address = path.join(dir, address);

    try{
//        cycleDir(address);
        console.log("");
        console.log("  create : %s", address);
        copyConfig(address);
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

var copyConfig = function(dir){
    var config = fs.readFileSync(
        path.join(__dirname, "../example/config.js")
    ) + "";
    config = config.replace(/(dir *\: *)\"\"/, function(str, a){
        return a + '"' + path.join(dir, "static").replace(/\\/g, "\\\\") + '"';
    });
    config = config.replace(/(controllerDir *\: *)\"\"/, function(str, a){
        return a + '"' + path.join(dir, "controller").replace(/\\/g, "\\\\") + '"';
    });
    fs.writeFileSync(
        path.join(dir, "config.js"),
        config
    );
};

var showError = function(error){
    console.log("");
    console.log(" error : %s", error.message);
    console.log("");
};