/**
@module server
@class server_global
**/
var serverConfig = require('../../config'),
    path = require('path'),
    virtual = require('./virtual'),
    buildHelper = require('../../build/src/buildhelper.js');

/**
在server上build应用
@method build
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var fullPath = request.params[0];
    buildHelper.build(fullPath,function(){
        response.redirect(request.headers.referer);
    });
};