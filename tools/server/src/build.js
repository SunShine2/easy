/**
@module server
@class server_global
**/
var build = require('../../build/build');

/**
在server上build应用
@method build
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var fullPath = request.params[0],
        retObj = {};
    build.build(fullPath,function(success){
        if(success){
            retObj.success = true;
        } else {
            retObj.success = false;
            retObj.mgs = '应用打包失败!';
        }

        response.write(JSON.stringify(retObj));
        response.end();
    });
};