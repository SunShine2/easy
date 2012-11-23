
var child_process = require('child_process'),
    path = require('path'),
    config = require('../../config'),
    appCfg = require('./config');

module.exports = function(request,response,next){
    var fullPath = request.params[0],
        pathInfo = fullPath.split('/'),
        buildBat = path.join(__dirname,'build.bat'),
        buildPath = path.join(config.path('caf'),'build','build'),
        appName = pathInfo[pathInfo.length - 1],
        id = appCfg.getAppId(fullPath);

    if(!id){
        response.write(JSON.stringify({success:false,msg:'请配置应用id!'}));
        response.end();
        return;
    }

    var build = child_process.spawn(buildBat,[buildPath,appName,'-c',id]);
    build.stdout.on('data',function(data){
        console.log(data.toString());
    });
    build.stderr.on('data',function(data){
        console.log(data.toString());
    });
    build.on('exit',function(code){
        if(code === 0){
            console.log('提交完成');
            response.write(JSON.stringify({success:true}));
        } else {
            console.log('提交完成');
            response.write(JSON.stringify({success:false,msg:'提交失败!'}));
        }
        response.end();
    });
};