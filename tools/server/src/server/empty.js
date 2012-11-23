/**
@module server
@class server_global
**/
/**
返回一个空的http请求结果
@method empty
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    response.writeHead(200, {'Content-Type': 'image/x-icon'} );
    response.end();
};