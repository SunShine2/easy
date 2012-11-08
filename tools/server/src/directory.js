var fs = require('fs'),
    parse = require('url').parse,
    path = require('path'),

    mustache = require('mustache');

var ICONS = {
    '.gif':'icon_gif.gif',
    '.htm':'icon_htm.gif',
    '.html':'icon_htm.gif',
    '.css':'icon_inf.gif',
    '.js':'icon_js.gif',
    '.php':'icon_php.gif'
};

function getIcon(fileName){
    var icon = ICONS[path.extname(fileName)];
    return icon || 'icon_file.gif';
}

var appHash = {};

/**
@module server
@class server_global
**/

/**
获取用户目录处理的express请求处理函数
@method directory
@static
@param {String} root:应用的根目录
@param {String} realPath:实际的请求路径,如果为空,则将pathname当做请求路径.(处理虚拟目录的情况)
@return 用户目录处理的express请求处理函数
**/
exports = module.exports = function(root,realPath){
    return function(request,response,next){
        var url = parse(request.url),
            pathname = url.pathname,
            dir = decodeURIComponent(path.normalize(path.join(root,realPath === undefined?pathname:realPath)));
        
        if(!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()){
            //console.log('目录不存在!',dir);
            next();
            return;
        }


        if(!/\/$/.test(pathname)){
            response.redirect(pathname + '/');
            return;
        }

        info = getDirecotryInfo(dir,pathname);

        response.end(mustache.to_html(getTpl(),info));
    };
};

/**
server的目录浏览处理类
@module server
@class directory
**/

/**
设置应用所在目录
@method setAppPath
@static
@param {Object} _ah:虚拟目录和本地目录对应表,如:{"/apps":"D:\\easy\\apps"}
**/
exports.setAppPath = function(_ah){
    appHash = _ah;
};

function getDirecotryInfo(fullPath,pathname){
    var dir = fullPath,
        parent_dirs = [],
        vPath,
        files,fileInfo = [],dirInfo = [],
        appInfo = [],
        paths = pathname.split('/'),pathInfo = [],
        info,i,
        stat,
        appOnly = !!(appHash[pathname] || appHash[pathname.replace(/\/$/,'')]);

    var currentDir = '/';
    for(i = 0; i < paths.length; i++){
        if(paths[i] !== ''){
            pathInfo.push({
                path:currentDir + paths[i] + '/',
                name:paths[i]
            });
            currentDir += paths[i] + '/';
        }
    }

    parent_dirs.push({name:'root',path:'/'});
    for(vPath in appHash){
        var name = vPath;
        if(name[0] === '/'){
            name = name.substr(1);
        }
        parent_dirs.push({name:name,path:vPath});
    }



    files = fs.readdirSync(dir);
    files.sort();

    for(i = 0; i < files.length; i++){
        var size,icon,ctime,mtime,arrInfo,app;
        stat = fs.statSync(dir + '/' + files[i]),

        ctime = timeFormat(stat.ctime);
        mtime = timeFormat(stat.mtime);

        if(stat.isDirectory()){
            app = getAppInfo(dir + '/' + files[i]);
            if(app){
                app.ctime = ctime;
                app.mtime = mtime;
                app.fileName = files[i];
                app.dir = dir + '/' + files[i];
                appInfo.push(app);
            }
            size = '';
            icon = 'icon_dir.gif';
            arrInfo = dirInfo;
        } else {
            size = toFixed(stat.size) + 'K';
            icon = getIcon(files[i]);
            arrInfo = fileInfo;
        }

        if(!appOnly){
            arrInfo.push({
                fileName:files[i],
                icon:icon,
                size:size,
                ctime:ctime,
                mtime:mtime
            });
        }
        
    }
    
    //上一级目录
    if(!appOnly && pathname !== '/'){
        stat = fs.statSync(dir);
        dirInfo.unshift({
            fileName:'..',
            icon:'icon_dir.gif',
            size:'',
            ctime:timeFormat(stat.ctime),
            mtime:timeFormat(stat.mtime)
        });
    }

    info = {
        fileInfo : dirInfo.concat(fileInfo),
        pathInfo : pathInfo,
        appInfo : appInfo,
        pathname : pathname,
        fullPath:fullPath,
        parent_dirs:parent_dirs
    };
    return info;
}


var _tpl = null;
function getTpl(){
    //if(_tpl === null){
        _tpl = fs.readFileSync(__dirname + "/../public/dir.html").toString();
    //}
    return _tpl;
}

function timeFormat(t){
    return t.getFullYear() + '-' 
        + (t.getMonth() + 1) + '-' 
        + t.getDate() + ' ' 
        + t.getHours() + ':'
        + t.getMinutes() + ':'
        + t.getSeconds();
}
function toFixed(size){
    return Math.round(size / 1024 * 100) / 10;
}

function getAppInfo(dir){
    var cfg = getAppJsonFile(dir + '/app.json'),
        info = null;
    if(cfg){
        info = {
            appName:cfg.appName
        };
    }
    return info;
}

function getAppJsonFile(fullPath){
    if(fs.existsSync(fullPath)){
        var strCfg = fs.readFileSync(fullPath).toString();
        var cfg = eval('(' + strCfg + ')');
        return cfg;
    }
    return null;
}