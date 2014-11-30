#!/usr/bin/env node
const cluster = require("cluster");

if(cluster.isMaster){
    process.title = "Harbors";

    const cmd = require("commander");
    const config = require("../tools/config");


    var current = process.cwd();

    cmd
        .version("0.5.0")
        .option("-s, --start [value]"    , "start server [part]"    , current)
        .parse(process.argv);

    var op = config.read(cmd.start);

    op = config.fill(op);

    var vhost = config.separation(op);

    var listen = config.extraction(vhost);

    var v = {
        controller: "VHOST",
        result: JSON.stringify(vhost)
    };
    var child;
    for(var i=0; i<op.config.process; i++){
        child = cluster.fork();
        child.send(v);
        listen.forEach(function(ser){
            child.send({
                controller: "START",
                result: JSON.stringify(ser)
            })
        });
    }

}else{
    process.title = "Harbors Worker";
    const worker = require("../server/worker");
    worker.listen();
}