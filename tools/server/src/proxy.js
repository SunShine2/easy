var http = require('http');
var url = require('url');
var querystring = require('querystring');

/**
@module server
@class server_global
**/
/**
proxy请求处理
@method proxy
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var proxyUrl = request.params[0],
        u = url.parse(proxyUrl),
        method = request.method,
        headers = request.headers,
        options = {
            //host:u.host,
            hostname:u.hostname,
            path:u.path,
            method:method,
            port:u.port || "80",
            headers:{
                "cookie":request.headers.cookie
            }
        };
    if(!proxyUrl){
        console.log('代理请求地址为空!');
        response.end();
        return;
    }

    function onResponse(res){
        response.writeHead(res.statusCode,res.headers);

        res.on('data',function(chunk){
            response.write(chunk,'binary');
        });
        res.on('end',function(){
            response.end();
        });
    }

    var req = http.request(options,onResponse);
    //var req = http.get(proxyUrl,onResponse);

    if(method.toLowerCase() == "post"){
        req.wirte(querystring.stringify(request.body));
    }

    req.on('error',function(e){
        //response.write('proxy error:' + e.message + '\n' + "host:" + res.header.host + "\n path:" + res.header.path);
        console.log('代理请求错误:' + e.message + '\n' + JSON.stringify(req._headers.host + "/" + req.path));
        
        response.end();
    });
    req.end();
};

