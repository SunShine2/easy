/*文件,目录的复制*/

var fs = require('fs'),
    path = require('path'),
    child_process = require("child_process");
/**
@module build
**/
/**
文件系统处理辅助方法(文件或目录的复制、移动、删除、打包)
@class fs2
@static
**/


/**
拷贝文件或目录
@method copy
@static
@param {String} origin 需要被拷贝的文件或者目录
@param {String} target 拷贝的目标目录
@param {Object} exclude 不需要拷贝的文件hash,如`{"d:\aaa",1}`
**/
function copy(origin,target,exclude){
    exclude = exclude ||  {};
    if(!fs.existsSync(origin)){
        console.log('文件或目录不存在:' + origin);
        return;
    }

    if(exclude[origin]){
        console.log('忽略文件',origin);
        return;
    }

    if(fs.statSync(origin).isFile()){
        console.log('复制文件:',origin);
        fs.writeFileSync(target,fs.readFileSync(origin));
    } else {
        if(!fs.existsSync(target)){
            fs.mkdirSync(target);
        }

        var files = fs.readdirSync(origin);
        for(var i=0; i<files.length; i++){
            var o = path.join(origin,files[i]),
                t = path.join(target,files[i]);

            copy(o,t,exclude);
        }
    }
}

/**
清理目录,将空目录和exclude中的文件删除
@method cleanFolder
@static
@param {String} fullDir 需要被清理的目录
@param {Object} exclude 目录中需要被删除的文件
**/
function cleanFolder(fullDir,exclude){
    exclude = exclude || {};
    var files = fs.readdirSync(fullDir);
    for(var i=0; i<files.length; i++){
        var o = path.join(fullDir,files[i]);
        if(fs.statSync(o).isFile()){
            if(exclude[o]){
                console.log('删除文件:',o);
                fs.unlinkSync(o);
            }
        } else {
            cleanFolder(o,exclude);
        }
    }

    files = fs.readdirSync(fullDir);
    if(files.length === 0){
        console.log('删除空目录:',fullDir);
        fs.rmdirSync(fullDir);
    }
}

/**
删除目录或文件
@method rmdirSync
@static
@param {String} fullDir 需要被删除的目录或文件路径
**/
function rmdirSync(fullDir){
    if(fs.statSync(fullDir).isFile()){
        fs.unlinkSync(fullDir);
        return;
    }
    var files = fs.readdirSync(fullDir);
    for(var i = 0 ;i < files.length; i++){
        var o = path.join(fullDir,files[i]);
        if(fs.statSync(o).isFile()){
            fs.unlinkSync(o);
        } else {
            rmdirSync(o);
        }
    }

    try{
        fs.rmdirSync(fullDir);
    } catch (e){
        console.log('删除目录失败:',fullDir);
    }
}
/**
创建目录,父目录不存在,则会先创建父目录
@method mkdirSync
@static
@param {String} path:需要创建的目录名称
**/
function mkdirSync(_p){
    var s = [],
        p = _p;

    while(!fs.existsSync(p)){
        s.push(p);
        p = path.dirname(p);
    }

    while(s.length !== 0){
        fs.mkdirSync(s.pop());
    }
}

/**
移动目录
@method move
@static
@param {String} origin:需要移动的目录
@param {String} target:移动的目标位置
**/
function move(origin,target){
    if(!fs.existsSync(origin)){
        console.log('文件或目录不存在:' + origin);
    }

    if(fs.statSync(origin).isFile()){
        fs.writeFileSync(target,fs.readFileSync(origin));
        fs.unlinkSync(origin);
    } else {
        if(!fs.existsSync(target)){
            fs.mkdirSync(target);
        }

        var files = fs.readdirSync(origin);
        for(var i=0; i<files.length; i++){
            var o = path.join(origin,files[i]),
                t = path.join(target,files[i]);

            move(o,t);
        }
        fs.rmdirSync(origin);
    }
}

/**
压缩文件或目录
@method zip
@static
@async
@param {String} origin 需要压缩的文件或者目录地址
@param {String} target 压缩完成后保存的地址,如果为空则存放到需要压缩的文件或目录同级的目录下
@param {Function} cb 压缩完成后的回调函数
**/
function zip(origin,target,cb){
    origin = path.normalize(origin);
    var arrDir = origin.split(path.sep),
        appName = arrDir[arrDir.length - 1],
        zipPath = path.join(__dirname,'../zip/zip.bat');

    var cmd = zipPath + ' ' + appName + ' ' + path.dirname(origin);
    child_process.exec(cmd, function(e){
        if(e){
            console.log(e);
            return;
        }
        var zipOrigin = path.join(origin,'../',appName + '.zip'),
            zipTarget = path.join(target,appName + '.zip');
        if(zipOrigin !== zipTarget){
            move(zipOrigin,zipTarget);
        }
        cb && cb();
    });
}

function unZip(origin,target){
    
}

exports.copy = copy;
exports.cleanFolder = cleanFolder;
exports.rmdirSync = rmdirSync;
exports.mkdirSync = mkdirSync;
exports.move = move;
exports.zip = zip;
