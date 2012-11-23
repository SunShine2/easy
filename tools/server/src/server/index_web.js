var fs = require('fs'),
    path = require('path'),
    parse = require('url').parse,

    send = require('send'),

    virtual = require('./virtual'),
    config = require('../config'),
    build = require('../modules/build');

/**
@module server
@class server_global
**/
/**
处理index页面请求
@method index
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var dir = request.params[0],
        pathInfo = virtual.parseVirtual(dir),
        fullPath,appJsonPath,
        rootPath = config.path('root');

    fullPath = pathInfo ? pathInfo.fullPath : path.join(rootPath,dir);
    appJsonPath = path.join(fullPath, 'app.json');

    if(!fs.existsSync(appJsonPath)){
        var pi = parse(request.url),
            pathname = pi.pathname,
            root = pi.root;

        if(pathInfo){
            pathname = pathInfo.pathname;
            root = pathInfo.root;
        }

        send(request, pathname).root(root).on('error', function(err){
            if (404 == err.status) return next();
            next(err);
        }).pipe(request);
    } else {
        response.writeHead(200, {"Content-Type": "text/html;chartset:utf-8"});
        build.getBuildedContent(fullPath,function(buildedStr){
            response.end(buildedStr);
        });
    }
};

