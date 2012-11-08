
/**
@module server
@class server_global
**/
var path = require('path'),
    fs = require('fs'),

    build = require('../../build/build');

/**
在server上提交应用
@method commit
@static
@param request {ServerRequest}
@param response {ServerResponse}
@param next {Function} 需要转向的下一个处理函数
**/

module.exports = function(request,response,next){
    var fullPath = request.params[0],
        retObj = {},
        appJsonPath = path.join(fullPath,'app.json'),
        strCfg = fs.readFileSync(appJsonPath).toString(),
        cfg = eval('(' + strCfg + ')'),
        id = cfg.id,
        version = cfg.version,
        end = function(){
            response.write(JSON.stringify(retObj));
            response.end();
        };

    if(!/^\d+$/.test(id)){
        retObj.success = false;
        retObj.msg = '请配置应用id,必须为数字';
        end();
        return;
    }

    build.build(fullPath,function(success,zipPath){
        if(!success){
            retObj.success = false;
            retObj.mgs = '应用build失败!';
            end();
            return;
        }

        build.commit(zipPath,id,version,function(success){
            retObj.success = success;
            if(!success){
                console.log('提交失败!');
                retObj.msg = '上传失败!';
            }
            console.log('提交结束!');
            end();
        });
        
    });
};