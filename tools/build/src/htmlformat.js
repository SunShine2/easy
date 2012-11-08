var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify,
    cleanCSS = require('clean-css'),
    html_minifier = require('html-minifier').minify,
    smushit = require('node-smushit'),
    less = require('less'),

    config = require('../../config'),
    util = require('./util');

exports = module.exports = HtmlFormat;

/**
@module build
**/
/**
依赖信息类
@class HtmlFormat
@constructor
@param {String} appPath 应用所在目录
@param {String} strHtml 首页的html内容
@param {Object} appCfg 当前应用的配置信息
@param {Object} info 页面中的样式或者脚本的依赖信息
@param {Function} onFinished 格式化完成以后的回调函数
**/

function HtmlFormat(appPath,strHtml,appCfg,info,onFinished){
    this._appPath = appPath;
    this._strHtml = strHtml;
    this._info = info;
    this._appCfg = appCfg;
    //this._replaceJobs = [];

    var pathArr = path.normalize(appPath).split(path.sep);
    this._appName = pathArr[pathArr.length - 1];


    this._onFishied = onFinished;
    this._$ = cheerio.load(this._strHtml);

    this._init();
}

/**
初始化页面内容,启动所有格式化流程
@method _init
@private
**/
HtmlFormat.prototype._init = function(){
    var self = this;

    //替换依赖中的脚本
    this._replaceScripts();

    //替换依赖中的样式
    this._insertCss(function(){
        self._complete();
        //替换外联的脚本和样式
        //self._getReplaceJobs();
        //self._runReplaceJob();
    });
};

/**
将依赖中的样式文件插入到DOM中,less处理
@method _insertCss
@private
@async
@param {Function} finished 脚本插入完成以后的回调函数
**/
HtmlFormat.prototype._insertCss = function(finished){
    var self = this,
        depCss = this._info.getCssModules(),
        strDepCss = '';

    for(i = 0; i< depCss.length; i++){
        strDepCss += depCss[i].content + '\n';
    }

    //去掉所有less和css标签,因为已经在依赖查询的时候找到了所有less的样式内容
    this._$('link[rel=stylesheet\\/less]').remove();
    this._$('link[rel=stylesheet]').remove();
    this._less(strDepCss,function(strCss){
        self._getCssBlock(strCss,function(cssBlock){
            self._$('head').append(cssBlock);
            //console.log('依赖样式插入完成!');
            if(finished){
                finished();
            }
        });
    });



};

/**
将依赖信息中的脚本插入或者替换掉页面中的内容

    1.将预加载的模块插入到loader脚本块后面,如果没有loader,则将预加载的内容插入到第一个script前面,如果没有script标签,则将预加载的脚本插入到head中
    1.在有依赖的脚本块前插入依赖的脚本
    2.loader脚本替换成$E函数的定义
    3.将有exclude标记的脚本替换成空的

@method _replaceScripts
@private

**/
HtmlFormat.prototype._replaceScripts = function(){
    var mGroup = this._info.getOrderedJsModuleGroup(),
        i,
        mainNode = this._$('script[loader=true]');

    for(i = 0; i < mGroup.length; i++){
        var node = this._$('script[uuid=' + mGroup[i].uuid + ']'),
            content;

        if(mGroup[i].uuid === '__root__preload'){
            if(mainNode.length !== 0){
                mainNode.after(this._getGroupJs(mGroup[i].modules));
            } else {
                mainNode = this._$('script').eq(0);
                if(mainNode.length !== 0){
                    mainNode.before(this._getGroupJs(mGroup[i].modules));
                } else {
                    mainNode = this._$('head').children().last();
                    mainNode.after(this._getGroupJs(mGroup[i].modules));
                }
            }
        } else {
            /*
            if(node.attr('loader') == 'true'){
                content = this._getJsBlock($E.toString());
            } else
            */
            if(node.attr('exclude') == 'true'){
                if(node.attr('include-deps') == 'true'){
                    mGroup[i].modules.pop();
                    content = this._getGroupJs(mGroup[i].modules);
                } else {
                    content = '';
                }
            } else {
                content = this._getGroupJs(mGroup[i].modules);
            }
            node.replaceWith(content);
        }
    }
};


/**
生成将外联的样式文件替换成内联的任务
@method _getReplaceJobs
@private
**/
/*
HtmlFormat.prototype._getReplaceJobs = function(){
    var self = this,
        css = this._$('link[rel=stylesheet]'),
        type,i;

    for(i = 0; i < css.length; i++){
        var href = css.eq(i).attr('href');
        if(href){
            this._replaceJobs.push({node:css.eq(i),url:href,type:'css'});
        }
    }
};
*/
/**
执行替换任务
@method _runReplaceJob
@private
**/
/*
HtmlFormat.prototype._runReplaceJob = function(){
    var self = this,
        fCount = 0;

    if(this._replaceJobs.length === 0){
        this._complete();
        return;
    }

    for(var i = 0; i < this._replaceJobs.length; i++){
        var job = this._replaceJobs[i],
            url = this._replaceJobs[i].url,
            strPath = util.isHttp(url)?url:path.join(this._appPath,url);

            //将被替换的文件加入到已包含的数组中
            this._info.appendExclude(strPath);
        util.getFileContent(strPath,getCallbackFn(job));
    }

    function getCallbackFn(job){
        return function(data){
            var str = data;
            if(job.type === 'css'){
                self._getCssBlock(str,function(cssBlock){
                    job.node.replaceWith(cssBlock);
                    fCount++;
                    tryComplete();
                },job.url);
            } else {
                str = self._getJsBlock(str);
                job.node.replaceWith(str);
                fCount++;
                tryComplete();
            }
        };
    }

    function tryComplete(){
        if(fCount === self._replaceJobs.length){
            self._complete();
        }
    }
};
*/
/**
格式化页面完成,调用执行完成回调
@method _complete
@private
**/
HtmlFormat.prototype._complete = function(){
    if(this._onFishied){
        var strHtml = this._$.html();

        if(this._appCfg.debug['html-minify'] == 'true'){
            strHtml = html_minifier(strHtml, {
                removeComments: true,
                collapseWhitespace:true,
                removeEmptyAttributes:true
            });
        }
        
        console.log('格式化完成!');
        this._onFishied(strHtml);
    }
};

/**
将一组脚本内容连接起来
@method _getGroupJs
@private
@param {Array} jsGroup 需要连接的脚本组
@return 连接后的脚本内容,包含`<script>`标签
**/
HtmlFormat.prototype._getGroupJs = function(jsGroup){
    var strJs = '';
    for(var i=0; i<jsGroup.length; i++){
        strJs += jsGroup[i].content || '';
    }
    return this._getJsBlock(strJs);
};

/**
给脚本内容增加`<script>`标签,根据配置执行是否压缩脚本
@method _getJsBlock
@private
@param {String} code 需要包装的脚本内容
@return 包装以后的脚本
**/
HtmlFormat.prototype._getJsBlock = function(code){
    if(code !== ''){
        var strJs = this._jsCompress(code);
        return '\n<script>\n' + strJs + '\n</script>\n';
    } else {
        return code;
    }
};

/**
将less内容替换成css
@method _less
@private
@async
@param {String} code less内容
@param {Function} callback less完成以后的回调,参数为转换以后的样式内容
**/
HtmlFormat.prototype._less = function(code,callback){
    try{
        less.render(code,function(e,css){
            if(e){
                console.log('less解析错误',e);
                callback(code);
            } else {
                callback(css);
            }
        });
    } catch(e){
        console.log('less解析错误!');
        callback(code);
    }
};

/**
给样式内容增加`<style>`标签,根据配置执行cssClean,datauri
@method _getCssBlock
@private
@async
@param {String} code 需要包装的样式内容
@param {Function} callback 包装完成以后的回调函数,参数为包装完成后的样式内容
@param {String} uri 当前文件的uri,用于处理datauri
**/
HtmlFormat.prototype._getCssBlock = function(code,callback,uri){
    if(code !== ''){
        var strCss = this._cssClean(code);
        this._cssDatauri(strCss,function(cssDatauri){
            callback('\n<style rel="stylesheet">\n' + cssDatauri + '\n</style>\n');
        },uri);
    } else {
        callback(code);
    }
};

/**
压缩脚本
@method _jsCompress
@private
@param {String} code 需要压缩的脚本
@return 如appCfg配置中jsCompress为true,则返回压缩后的脚本,否则返回原来的脚本内容.
**/
HtmlFormat.prototype._jsCompress = function(code){
    if(this._appCfg.debug.jsCompress == 'true'){
        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);

        var finalCode = pro.gen_code(ast,{
            inline_script : true
        });
        return finalCode;
    }
    return code;
};

/**
压缩样式
@method _cssClean
@private
@param {String} strCss 需要清理的脚本内容
@return 如appCfg配置中cssClean为true,则返回压缩后的样式,否则返回原来的样式内容.
**/
HtmlFormat.prototype._cssClean = function(strCss){
    //console.log('this._appCfg.debug.cssClean:',this._appCfg.debug.cssClean,this._appCfg.debug.cssClean == 'true');
    if(this._appCfg.debug.cssClean == 'true'){
        strCss = cleanCSS.process(strCss);
    }
    return strCss;
};


/**
将样式中路径后面有?datauri的图片替换成base64的内容
@method _cssDatauri
@private
@async
@param {String} strCss 需要处理的样式内容
@param {Function} callback 处理完成以后的回调,参数为处理后的样式内容
@param {String} uri 当前样式文件的uri
**/
HtmlFormat.prototype._cssDatauri = function(strCss,callback,uri){
    if(this._appCfg.debug.datauri != 'true'){
        callback(strCss);
        return;
    }

    var isSmushit = this._appCfg.debug.smushit == 'true',
        cssImgs = util.getCssDatauriImgs(strCss,uri,this._appPath),
        fCount = 0,i,
        dataUriJobs = [];

    for(i = 0; i<cssImgs.length; i++){
        this._info.appendExclude(cssImgs[i]);
        dataUriJobs.push({url:cssImgs[i],content:null});
    }

    for(i = 0; i<dataUriJobs.length; i++){
        util.getImageBase64(dataUriJobs[i].url,getCallbackFn(dataUriJobs[i]),isSmushit);
    }

    function getCallbackFn(job){
        return function(data){
            job.content = data;
            fCount++;
            dataUriComplete();
        };
    }


    function dataUriComplete(){
        if(fCount == dataUriJobs.length){
            var arrDataUri = [],strDataUriCss;
            for(i = 0; i < dataUriJobs.length; i++){
                arrDataUri.push(dataUriJobs[i].content);
            }
            strDataUriCss = util.getCssDatauriReplace(strCss,arrDataUri);
            callback(strDataUriCss);
        }
    }

    if(dataUriJobs.length === 0){
        dataUriComplete();
    }
};

//替换页面中加载器的函数
function $E(){
  var args = arguments,
      fn = args[args.length - 1];

    if(typeof fn === 'function'){
        fn();
    }
}