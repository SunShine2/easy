var fs = require('fs'),
    path = require('path'),
    cafAppsIdFilePath = './caf_apps_id.json',
    cafAppsId = require(cafAppsIdFilePath);


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
        fullDir = path.normalize(request.params[1]);
    if(opt === 'get'){
        var objRet = {};
        objRet.id = cafAppsId[fullDir] || '';
        response.write(JSON.stringify(objRet));
        response.end();
    } else {
        var id = request.body.id,
            strPath = path.join(__dirname,cafAppsIdFilePath);
        cafAppsId[fullDir] = id;
        fs.writeFileSync(strPath,JSON.stringify(cafAppsId),'utf8');
        response.write(JSON.stringify({success:true}));
        response.end();
    }
};

module.exports.getAppId = function(fullpath){
    fullpath = path.normalize(fullpath);
    return cafAppsId[fullpath];
};
