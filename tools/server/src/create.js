/**
@module server
@class server_global
**/

var path = require('path'),
    fs = require('fs'),
    virtual = require('./virtual'),
    fs2 = require('../../build/util/fs2');

/**
在serevr上创建一个应用(express请求处理函数)
@method create
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var pathname = request.params[0],
        name = request.params[1],
        pathInfo = virtual.parseVirtual('/' + pathname + '/' + name),
        origin = path.join(__dirname,'../','examples/demo'),
        target = pathInfo.fullPath,
        objRet = {};

    if(!name){
        objRet.success = false;
        objRet.msg = '请输入应用名称';
    } else if(fs.existsSync(target)){
        objRet.success = false;
        objRet.msg = '应用名已存在!';
    } else {
        fs2.copy(origin,target);
        objRet.success = true;
    }
    response.write(JSON.stringify(objRet));
    response.end();
};