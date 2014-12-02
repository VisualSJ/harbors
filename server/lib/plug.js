

exports.createList = function(){
    return new Queue();
};

var Queue = function(){
    this.task = [];
};

Queue.prototype.add = function(task){
    if(task)
        this.task.push(task);
};

Queue.prototype.end = function(end){
    var next = function(){
        var current = this.task.shift();
        if(current)
            current(next);
        else
            end();
    };
};

exports.get = function(){

};

exports.register = function(){

};