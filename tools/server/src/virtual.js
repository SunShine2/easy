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
    pathHash = virtuals;
}

/**
设置虚拟目录
@method virtual
@static
@param {Object} virtuals 虚拟目录参数函数对应表,如{'/__public':'d:\\easy\\build\\public'}
@return {Function} express请求处理函数
**/
exports = module.exports = function(virtuals){
  setVirtuals(virtuals);

  return function(req, res, next) {
    if ('GET' != req.method && 'HEAD' != req.method) return next();

    var pathname = url.parse(req.url).pathname,
        pathInfo = parseVirtual(pathname),
        fullPath;

    if(!pathInfo){
        next();
        return;
    }

    fullName = pathInfo.fullPath;

    if(fs.existsSync(fullName) && fs.statSync(fullName).isDirectory()){
        directory(pathInfo.root,pathInfo.pathname)(req,res,next);
    } else {
        send(req, pathInfo.pathname).root(pathInfo.root).on('error', error).pipe(res);
    }

    function error(err) {
      if (404 == err.status) return next();
      next(err);
    }

  };
};

function parseVirtual(_pathname){
    for(var p in pathHash){
        if(_pathname.indexOf(p) === 0){
            var reg = new RegExp('^' + p + '($|/)'),
                root = pathHash[p],
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

exports.mime = send.mime;