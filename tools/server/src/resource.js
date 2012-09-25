/**
@module server
@class server_global
**/
/**
/__resource请求处理
@method resource
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var url = request.params[0];
    response.redirect(url); //重定向
};

