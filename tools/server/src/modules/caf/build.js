
var child_process = require('child_process'),
    path = require('path'),

    config = require('../../config');

module.exports = function(request,response,next){
    var fullPath = request.params[0],
        pathInfo = fullPath.split('/'),
        buildBat = path.join(__dirname,'build.bat'),
        buildPath = path.join(config.path('caf'),'build','build'),
        appName = pathInfo[pathInfo.length - 1];

    var build = child_process.spawn(buildBat,[buildPath,appName]);
    build.stdout.on('data',function(data){
        console.log(data.toString());
    });
    build.stderr.on('data',function(data){
        console.log(data.toString());
    });
    build.on('exit',function(code){
        if(code === 0){
            console.log('build完成');
            response.write(JSON.stringify({success:true}));
        } else {
            console.log('build失败');
            response.write(JSON.stringify({success:false}));
        }
        response.end();
    });
};