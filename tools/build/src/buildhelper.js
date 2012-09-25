var fs = require('fs'),
    vm = require('vm'),
    cprocess = require("child_process"),
    path = require('path'),

    cheerio = require ('cheerio'),
    mustache = require('mustache'),


    fs2 = require('../util/fs2'),
    config = require('../../config'),
    Task = require('./task'),
    HtmlFormat = require('./htmlformat');
/**
@module build
**/
/**
build帮助类
@class BuildHelper
@static
**/

/**
mustache格式化页面
@method formatIndex
@private
@param {String} tpl 页面模板
@param {Object} data 格式化时需要的参数
@return {String} mustache格式化以后的内容
**/
function formatIndex(tpl,data){
    return mustache.to_html(tpl,data);
}

/**
获取应用的信息
@method getAppInfo
@private
@param {String} appPath 应用目录
@param {Boolean} isDebug 是否为debug,为false时将会把所有debug的配置改成release时的状态
@return {Object} 应用信息,strHtml:页面的html内容,appCfg:应用的配置
**/
function getAppInfo(appPath,isDebug){
    var indexPath = path.join(appPath, 'index.html'),
        appJsonPath = path.join(appPath, 'app.json'),
        strHtml,strCfg,appCfg;

    if(!fs.existsSync(appPath)){
        console.log('应用目录不存在:' + appPath);
        return;
    }

    if(!fs.existsSync(indexPath)){
        console.log('应用首页文件不存在:' + indexPath);
        return;
    }

    if(!fs.existsSync(appJsonPath)){
        console.log('没有找到' + appJsonPath + '文件,debug设为false');
        strCfg = '';
        appCfg = {debug:false};
    } else {
        strCfg = fs.readFileSync(appJsonPath).toString(),
        appCfg = eval('(' + strCfg + ')');  //appCfg = require(appJsonPath);
    }

    if(isDebug === false){
        appCfg.debug = false;
    }

    appCfg = processAppCfg(appCfg);
    strHtml = formatIndex(fs.readFileSync(indexPath).toString(),appCfg);

    return {
        strHtml:strHtml,
        appCfg:appCfg
    };
}

/**
处理应用的配置信息,根据appCfg中的debug选项修改配置信息
@method processAppCfg
@private
@param {Object} appCfg 当appCfg.debug为false时,将所有debug选项改为release时的状态
@return {Object} 处理以后的配置信息
**/
function processAppCfg(appCfg){
    if(!appCfg.debug){
        appCfg['inline-resource'] = true;
        appCfg['html-minify'] = true;
        appCfg['jsCompress'] = true;
        appCfg['cssClean'] = true;
        appCfg['datauri'] = true;

    }
    appCfg['html-minify'] = false;
    return appCfg;
}

/**
获取build以后的index页面内容
@method getBuildedContent
@static
@param {String} 应用所在的目录
@param {Function} index页面创建完成以后的回调,参数:_strHtml{String}:页面的内容,info{dep_info}:依赖信息,已处理的文件等信息
@param {Boolean} isDebug 是否为debug模式.为false则忽略debug的配置信息
**/
function getBuildedContent(appPath,callback,isDebug){
    var appInfo = getAppInfo(appPath,isDebug);
    if(!appInfo){
        callback(false);
        return;
    }

    if(appInfo.appCfg['inline-resource'] !== true){
        callback(appInfo.strHtml);
        return;
    }
    console.log('开始创建页面内容...');
    var strHtml = appInfo.strHtml,
        appCfg = appInfo.appCfg,
        $ = cheerio.load(strHtml),
        scripts = $('script'),
        less = $('link[rel=stylesheet\\/less]'),
        strContent = '',
        i,strJs,
        uuid,
        task = new Task(appPath,$);   //创建一个依赖查找任务
        
    for(i=0; i<scripts.length; i++){
        uuid = '__script__' + i;
        if(scripts.eq(i).attr('src')){
            task.appendScript(scripts.eq(i).attr('src'),uuid);
        } else {
            strJs = scripts[i].children && scripts[i].children.length > 0 && scripts[i].children[0].data;
            task.appendCode(strJs,uuid);
        }
        scripts.eq(i).attr('uuid',uuid);
    }
    for(i = 0; i <less.length;i++){
        uuid = '__less__' + i;
        less.eq(i).attr('uuid',uuid);
        var href = less.eq(i).attr('href');
        if(href){
            task.appendLess(href,uuid);
        }
    }
    
    task.finished(function(info){
        var format = new HtmlFormat(appPath,$.html(),appCfg,info,function(_strHtml){
            console.log('页面内容创建完成!');
            callback(_strHtml,info);
        });
    });
    task.start();
}

/**
将应用打包
 <dl>
 <dt>build步骤:</dt>
 <dd>
 1.生成index页面内容
 <dl>
  <dd>1.1 替换js (依赖处理,内容获取,替换html)</dd>
  <dd>1.2 替换css (less依赖处理,datauri,内容获取,替换html)</dd>
  <dd>1.3 html datauri</dd>
  </ul>
 </dd>
 <dd>2.将应用目录复制到tmp,删除已经被打包的文件</dd>
 <dd>3.替换index</dd>
 <dd>4.打包成zip</dd>
</dl>
@method build
@static
@param {String} appPath 应用所在的目录
@param {Function} callback build完成以后的回调
**/
function build(appPath,callback){
    appPath = path.normalize(appPath);
    var appName = appPath.split(path.sep).pop();
        tmpPath = path.join(__dirname,'../target',appName);   //临时目录

    console.log('buld paths',appPath,tmpPath);
    getBuildedContent(appPath,function(buildedStr,info){
        if(!info){
            console.log('build 失败');
            return;
        }

        var strIndex = buildedStr,
            exclude = info.getExclude();

        if(fs.existsSync(tmpPath)){
            fs2.rmdirSync(tmpPath);
        }

        fs2.copy(appPath,tmpPath,exclude);
        fs2.cleanFolder(tmpPath);

        fs.writeFileSync(path.join(tmpPath,'index.html'),strIndex);

        fs2.zip(tmpPath,path.join(__dirname,'../','target'),function(){
            fs2.rmdirSync(tmpPath);
            console.log('build 完成');

            callback && callback();
        });
        
    },false);
}

exports.getBuildedContent = getBuildedContent;
exports.build = build;




