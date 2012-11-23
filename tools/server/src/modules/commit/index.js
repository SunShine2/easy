var path = require('path'),
    child_process = require("child_process");

/**
提交工具
@class commit
@static
**/
/**
提交应用
@method commit
@static
@async
@param {String} zip 应用压缩包文件路径
@param {String} id 应用id
@param {String} version 版本号
@param {Function} callback 提交完成以后的回调
**/
exports = module.exports = function commit(zipPath,id,version,callback){
    version = version || '';
    var commitPath = path.join(__dirname,'../commit/commit.bat'),
        cmd = commitPath + ' ' + zipPath + ' ' + id + ' ' + version;
        //spawn = child_process.spawn,
        //cmt = spawn(commitPath,[zipPath,id,version]);

    callback = callback || function(){};
    console.log('提交应用...');
    //console.log('正在提交应用:' + zipPath,id,version);
    //console.log('提交命令:',cmd);
    /*
    cmt.stdout.on('data',function(data){
        console.log(data.toString());
    });
    cmt.stderr.on('data',function(data){
        console.log('commit error:',data.toString());
    });

    cmt.on('exit',function(code){
        if(code !== 0){
            callback(false);
            console.log('commit error:',code);
        } else{
            callback(true);
        }
    });
    */
    child_process.exec(cmd, function(e){
        if(e){
            console.log(e);
            callback(false);
            return;
        }
        console.log('提交完成!');
        callback && callback(true);
    });
}
