/**
@module server
@class server_global
**/

var send = require('send'),
    url = require('url'),
    join = require('path').join,
    fs = require('fs'),
    directory = require('./directory');

var pathHash = {};

function setVirtuals(virtuals){
    if(virtuals){
        for(var p in virtuals){
            pathHash[p] = virtuals[p];
        }
    }
}

/**
设置虚拟目录
@method virtual
@static
@param {Object} virtuals 虚拟目录参数函数对应表,如{'/__public':'d:\\easy\\build\\public'}
@return {Function} express请求处理函数
**/
exports = module.exports = function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var pathname = url.parse(req.url).pathname,
        pathInfo = parseVirtual(pathname);
    if(!pathInfo){
        next();
        return;
    }

    if(!fs.existsSync(pathInfo.fullPath)){
        console.log('目录',pathInfo.fullPath,'不存在,请检查虚拟目录配置信息');
        res.end('Directory does not exist:' + pathInfo.fullPath);
        return;
    }
    if(fs.statSync(pathInfo.fullPath).isDirectory()){
        directory.directory(req,res,next,pathInfo.fullPath);
    } else {
        send(req, pathInfo.pathname).root(pathInfo.root).on('error', error).pipe(res);
    }

    function error(err) {
      if (404 == err.status) return next();
      next(err);
    }
};

function parseVirtual(_pathname){
    for(var p in pathHash){
        var reg = new RegExp('^' + p + '($|/)');
        if(reg.test(_pathname)){
            var root = pathHash[p],
                pathname = _pathname.replace(reg,'');
            return {
                root : root,
                pathname : pathname,
                fullPath : join(root,pathname)
            };
        }
    }
}

/**
server的虚拟目录解析类
@class virtual
**/
/**
解析虚拟路径
@method parseVirtual
@static
@param {String} _pathname 当前访问的路径
@return {Object} 返回解析后的路径信息,包含根目录,路径,完整路径
**/

exports.parseVirtual = parseVirtual;
exports.setVirtuals = setVirtuals;
exports.mime = send.mime;