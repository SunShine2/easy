var fs = require('fs'),
    path = require('path'),
    parse = require('url').parse,

    send = require('send'),

    virtual = require('./virtual'),
    config = require('../../config');


/**
@module server
@class server_global
**/
/**
处理config获取,修改请求
@method create
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/
module.exports = function(request,response,next){
    var opt = request.params[0],
        fullDir = path.normalize(request.params[1]),
        dirName = fullDir.split(path.sep).pop(),
        pathInfo = virtual.parseVirtual(fullDir),
        appJsonPath,
        objRet;
    appJsonPath = path.join(fullDir, 'app.json');

    if(opt === 'get'){
        if(fs.existsSync(appJsonPath)){
            var strCfg = fs.readFileSync(appJsonPath).toString();
            objRet = eval('(' + strCfg + ')');
        }
        if(!objRet){
            objRet = {
                appName:dirName,
                debug:{
                    "inline-resource":false
                }
            };
        }
        objRet.dir = dirName;
        response.write(JSON.stringify(objRet));
        response.end();
    } else {
        var newdirName = request.body.dir;

        delete request.body.dir;
        var strJson = JSON.stringify(request.body)
            .replace(/\{/g,'{\n  ')
            .replace(/\}/g,'\n}')
            .replace(/,/g,',\n  ');

        fs.writeFileSync(appJsonPath,strJson,'utf8');

        if(newdirName !== dirName){
            fs.renameSync(fullDir,path.join(path.dirname(fullDir),newdirName));
        }
        response.write(JSON.stringify({success:true}));
        response.end();
    }
};

