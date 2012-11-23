var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    mustache = require('mustache'),
    config = require('../../config');


var strTpl = fs.readFileSync(path.join(__dirname,'tpl','index.html')).toString(),
    cafPath = config.get('caf'),
    sdkCfgPath = path.join(cafPath,'build','sdkconf.json'),
    frameworkAppCfgPath = path.join(cafPath,'framework','app.json'),
    sdkCfg,frameAppCfg,cafAppsPath;

    if(!cafPath){
        module.exports = null;
        return;
    }
    if(!fs.existsSync(sdkCfgPath)){
        console.log('文件:',sdkCfgPath, '不存在,请配置caf目录');
        module.exports = null;
        return;
    }

    if(!fs.existsSync(frameworkAppCfgPath)){
        console.log('文件:',frameworkAppCfgPath, '不存在,请配置caf目录');
        module.exports = null;
        return;
    }

    sdkCfg = require(sdkCfgPath);
    frameAppCfg = require(frameworkAppCfgPath);
    cafAppsPath = path.join(cafPath,sdkCfg['path_apps']);

    if(!fs.existsSync(cafAppsPath)){
        console.log('caf应用目录:',cafAppsPath, '不存在,请在caf配置中设置caf框架应用存放的目录');
        module.exports = null;
        return;
    }


frameAppCfg.src = '/caf/framework/lib/aui.lib.js';
frameAppCfg.pathbase = "/caf/framework/";
frameAppCfg.conf = JSON.stringify(frameAppCfg.conf);//parseConf(frameAppCfg.conf);

module.exports = function(virtual,directory){
    virtual.setVirtuals({
        '/caf/apps': cafAppsPath,
        '/caf': cafPath
    });

    directory.setAppPath({'/caf/apps':cafAppsPath});

    return function(request,response,next){
        var pathInfo = request.params[0].split('/');
        if(pathInfo[0] == 'apps' && pathInfo[1]){
            var appDir,appCfg,appName;
            appDir = path.join(cafAppsPath,pathInfo[1]);
            if(!fs.existsSync(path.join(appDir,'app.json'))){
                next();
                return;
            }
            appCfg = require(path.join(appDir,'app.json'));
            if(!appCfg.name || !(~appCfg.name.indexOf('.app'))){
                next();
                return;
            }
            appName = appCfg.name.replace(/\.app/,'');

            if(pathInfo[2] == 'index.html'){
                var strIndex = getCafIndex(appDir);
                if(strIndex){
                    response.writeHead(200, {"Content-Type": "text/html;chartset:utf-8"});
                    response.end(strIndex);
                    return;
                }
            } else if(pathInfo[2] == 'lib') {
                appDir = path.join(cafAppsPath,pathInfo[1]);
                appCfg = require(path.join(appDir,'app.json'));
                appName = appCfg.name.replace(/\.app/,'');

                if( (pathInfo[3] == appName + '.lib.js') || ( pathInfo[3] == appName + '.tpl.js') ) {
                    var strRes = (pathInfo[3] == appName + '.lib.js')?getAppLibJs(appName,appDir):getAppTplJs(appName,appDir);

                    response.writeHead(200, {"Content-Type": "text/javascript;charset=utf-8"});
                    response.end(strRes);
                    return;
                }
            }
        }

        next();
    };
};

function getAppLibJs(appName,appDir){
    var strLib = fs.readFileSync(path.join(appDir,'src','lib',appName + '.lib.js')).toString(),
        reg = /import ([^;]+)/g;
    strLib = strLib.replace(reg,function(match,file){
        var fPath = path.join(appDir,'src','classes',file.replace(/\./g,path.sep)) + '.js';
        var strJs = fs.readFileSync(fPath).toString();
        //
        strJs = strJs.replace(/_class\s*\(\s*"([^,]+)"\s*,\s*([^,]+),\s*function\s*\(\s*\)\s*\{/,function(mod,cls,base){
            return '_class("' + cls + '", ' + base + ', function(_super, _event){';
        });
        return strJs;
    });
    return strLib;
}

function getAppTplJs(appName,appDir){
    var strTpl = fs.readFileSync(path.join(appDir,'src','lib',appName + '.tpl.js')).toString(),
        reg = /[^{,\n]+\.xml/g,
        tplObj = {},
        match,
        isReplaced = false;

    while(match = reg.exec(strTpl)){
        var fPath = path.join(appDir,'src','tpl',match[0]);
        tplObj[match] = fs.readFileSync(fPath).toString()
            .replace('<?xml version="1.0" encoding="utf-8"?>','')
            .replace(/[\n\t\r]/g,'')
            .replace(/\>\s*\</g,'><')
            .replace(/\<!--.*?--\>/g,'');
    }

    strTpl = strTpl.replace(/\{[^\}]*\}/, JSON.stringify(tplObj));
    return strTpl;
}
function getApplicationConfig(conf){
    var cfg = {};
    cfg.name = conf.name;
    cfg.conf = JSON.stringify(conf);
    return cfg;
}

function parseConf(conf){
    var strCfg = JSON.stringify(conf);
    return strCfg.replace(/"/g,"'");
}

function getCafIndex(appDir){
    var appCfg = require(path.join(appDir,'app.json'));
    return mustache.to_html(strTpl,{
        framework: frameAppCfg,
        application: getApplicationConfig(appCfg)
    });
}