/**
@module server
@class server_global
**/

var path = require('path'),
    fs = require('fs'),
    virtual = require('./virtual'),
    config = require('../config'),
    fs2 = require('../lib/fs2');

/**
在serevr上创建一个应用(express请求处理函数)
@method create
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var fullPath = request.params[0],
        cfg = request.body,
        appDir = cfg.dir,
        origin = config.get('appTpl'),
        target = path.join(fullPath,appDir),
        appJsonPath = path.join(target,'app.json'),
        objRet = {};

    origin = origin?origin:path.join(__dirname,'../../examples/demo');

    if(!cfg.dir){
        objRet.success = false;
        objRet.msg = '请输入应用名称';
    } else if(fs.existsSync(target)){
        objRet.success = false;
        objRet.msg = '应用目录' + appDir + '已存在!';
    } else if(!fs.existsSync(origin)) {
        objRet.success = false;
        objRet.msg = '模板文件目录' + origin + '不存在!';
    } else {
        fs2.copy(origin,target);
        objRet.success = true;

        delete request.body.dir;
        var strJson = JSON.stringify(request.body)
            .replace(/\{/g,'{\n  ')
            .replace(/\}/g,'\n}')
            .replace(/,/g,',\n  ');
        fs.writeFileSync(appJsonPath,strJson,'utf8');
    }
    response.write(JSON.stringify(objRet));
    response.end();
};