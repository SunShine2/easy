

//系统模块
var fs = require('fs'),
    path = require('path'),
    vm = require('vm'),
    http = require('http');

//本地模块
var seaInf = require('./inf'),
    util = require('./util'),
    DepInfo = require('./depsinfo');

exports = module.exports = Deps;

/**
@module build
**/
/**
依赖类,查找index中所有依赖的脚本和样式资源
@class Deps
@constructor
@param {String} appPath 应用所在目录
@param {String} codes 页面中内联的脚本和样式文件内容
@param {Document} [optional] 页面的dom结构
**/
function Deps(cfg,codes,doc){
    this._appPath = cfg.appPath;
    this._appCfg = cfg.appCfg;
    this._codes = codes;
    this._rootModules = []; //根模块信息,一个script标签对应一个根模块

    this._moduleCache = {};
    this._onFinished = null;

    this._seaContext = vm.createContext(seaInf);
    this._seaContext.$E.init();
    this._seaContext.setDocument(doc);
}

//获取exlucehash表
/**
获取在加载器的config中配置的_exclude项信息,_exclude中的模块不会被打包到页面中
@method _getExluceHash
@private
@return {Object} _excluce的hash映射,如`{'plus-less':1}`
**/
Deps.prototype._getExluceHash = function(){
    var seaCfg = this._getLoaderCfg(),
        exclude = seaCfg._exclude || [],
        exclude_onbuild = seaCfg._exclude_onbuild || [],
        hashExclude = {},
        i;
    if(this._appCfg.debug.debug == 'false'){
        exclude = exclude.concat(exclude_onbuild);
    }
    for(i=0; i<exclude.length; i++){
        hashExclude[exclude[i]] = 1;
    }
    return hashExclude;
};
/**
获取加载器配置信息
@method _getLoaderCfg
@private
@return {Object} 返回加载器的配置信息
**/
Deps.prototype._getLoaderCfg = function(){
    return vm.runInContext('$E.getConfig()',this._seaContext) || {};
};

/**
将js代码放到加载器的环境下运行一次
@method _runCode
@private
@param {String} code 需要执行的代码
**/
Deps.prototype._runCode = function(code){
    try {
        vm.runInContext(code,this._seaContext);
    } catch(e){}
};

/**
从代码中查找依赖信息
@method _getDependenciesInCode
@private
@param {String} code 需要查找的脚本代码
@return {Array} 代码依赖的模块信息
**/
Deps.prototype._getDependenciesInCode = function(code){
    //查找前先执行一遍
    this._runCode(code);
    var paramsReg = /\$E\s*\(([^();]*)/g,
        depsReg = /['"]([^"']+)["']/g;

    var deps = [],
        match,match2;

    while(match = paramsReg.exec(code)){
        while(match2 = depsReg.exec(match[1])){
            deps.push(match2[1]);
        }
    }
    return deps;
};

/**
获取样式的依赖信息
@method _getCssDeps
@private
@param {String} cssCode 需要查找依赖的样式代码
@return {Array} 当前样式代码依赖的信息
**/
Deps.prototype._getCssDeps = function(cssCode){
    return util.getCssDeps(cssCode);
};

/**
启动依赖关系分析
@method start
**/
Deps.prototype.start = function(){
    //载入资源文件
    console.log('分析依赖关系...');
    if(this._codes.length === 0){
        this._fileLoadCompleted();
    } else {
        this._loadFiles();
    }
};

/**
载入资源文件
@method _loadFiles
@private
**/
Deps.prototype._loadFiles = function(){
    var i,scr,mRoot;
    //开始依赖查找前把需要从文件或者http读取的文件先缓存一份
    for(i = 0; i < this._codes.length; i++){
        scr = this._codes[i];
        mRoot = {
            uri:scr.uri || '__root__' + i,
            content:util.removeComments(scr.content),
            cached:2,
            uuid:this._codes[i].uuid,
            type:scr.type === 'less'?'css':scr.type
        };
        this._saveRootModule(mRoot);
    }


    //预加载模块,依赖查找完成以后需要移动到根模块的最前面
    var mPreload = {
        alias:'__root__preload',
        uri:'__root__preload',
        content : '',
        cached:2,
        uuid:'__root__preload'
    };

    this._saveRootModule(mPreload);

    for(i = 0;i < this._rootModules.length; i++){
        this._appendDependenciesToModule(this._rootModules[i]);
    }

    this._checkLoadComplete();
};

/**
保存根模块状态
<dl>
    <dt>模块的信息</dt>
    <dd>id:模块id(使用路径)</dd>
    <dd>deps:依赖的信息</dd>
    <dd>cached:依赖是否已分析0:未分析 1:正在读取文件 2:已分析</dd>
    <dd>content:内容</dd>
</dl>
@method _saveRootModule
@private
@param {Object} m 模块信息
**/
Deps.prototype._saveRootModule = function(m){
    this._saveModule(m);
    this._rootModules.push(m);
};

/**
保存模块信息
<dl>
    <dt>模块的信息</dt>
    <dd>id:模块id(使用路径)</dd>
    <dd>deps:依赖的信息</dd>
    <dd>cached:依赖是否已分析0:未分析 1:正在读取文件 2:已分析</dd>
    <dd>content:内容</dd>
</dl>
@method _saveModule
@private
@param {Object} m 模块信息
@return {Object} 保存以后的模块信息
**/
Deps.prototype._saveModule = function(m){
    var module;
    if(!m.uri){
        return m;
    }

    module = this._moduleCache[m.uri];
    if(!module){
        module = this._moduleCache[m.uri] = m;
    }

    module.deps = m.deps || module.deps || [];
    module.cached = m.cached || module.cached || 0;
    module.content = m.content || module.content || '';
    module.type = m.type || module.type || 'js';
    module.factory = m.factory || module.factory || '';
    module.isModuleDefine = m.isModuleDefine || module.isModuleDefine || false;
    //module.isPreload = m.isPreload || module.isPreload || false;

    if(typeof m.isSeajsModule !== 'undefined' ){
        module.isSeajsModule = m.isSeajsModule;
    } else {
        module.isSeajsModule = typeof module.isSeajsModule === 'undefined'?true:module.isSeajsModule;
    }

    //console.log('_saveModule:',module);
    return module;
};

/**
根据uri获取模块信息
@method _getModule
@private
@param {String} uri 模块的uri
@return uri对应的模块信息
**/
Deps.prototype._getModule = function(uri){
    return this._moduleCache[uri];
};


/**
查询uri对应的模块依赖是否已经分析
@method _moduleStatus
@private
@param {String} uri 模块的uri
@return {Number} uri对应的模块状态
**/
Deps.prototype._moduleStatus = function(uri){
    return this._moduleCache[uri]?this._moduleCache[uri].cached:0;
};

/**
设置依赖查找完成以后的回调函数(在start调用以前设置)
@method onFinished
@param {Function} fn 依赖查找完成以后的回调函数
**/
Deps.prototype.onFinished = function(fn){
    this._onFinished = fn;
};

/*辅助函数*/

/**
将模块名称转化成uri
@method _parseAliasToUri
@private
@param {String} alias 模块的名称(别名)
@param {String} refUri 引用该模块的模块uri
@return 名称对应的uri
**/
Deps.prototype._parseAliasToUri = function(alias,refUri){
    var uri,
        cfg = this._getLoaderCfg();

    if(cfg.alias && cfg.alias[alias]){
        uri = typeof cfg.alias[alias] === 'string'?cfg.alias[alias]:cfg.alias[alias].path;
    }

    if(!uri){
        uri = alias;
    }

    if(!util.isHttp(uri)){
        if(refUri && refUri.indexOf('__root__') === -1){
            if(util.isHttp(refUri)){
                uri = path.dirname(refUri) + "/" + uri;
            } else {
                uri = path.join(path.dirname(refUri),uri);
            }
        } else {
            uri = path.join(this._appPath,uri);
        }
    }
    
    //uri += (util.isCss(uri) || util.isJs(uri))?'':'.js';
    
    /*
    console.log('======start=========');
    console.log(alias);
    console.log(refUri);
    console.log(uri);
    console.log('======end=========');
    */

    return uri;
};

/**
分析代码并将依赖信息写入到模块中
@method _appendDependenciesToModule
@private
@param {Object} module 模块信息
**/
Deps.prototype._appendDependenciesToModule = function(module){
    //找到当前模块的所有依赖
    //console.log('查找模块依赖:',module.uri);
    var modules,loadUris = [];
    if(module.type === 'css' || module.type === 'less'){
        var depCss = this._getCssDeps(module.content);
        //console.log(module.uri,'找到样式依赖:',depCss);
        for(var k = 0; k < depCss.length; k++){
            var cUri,mcss,
                name = depCss[k];
            cUri = this._parseAliasToUri(name,module.uri);
            mcss = this._saveModule({uri:cUri,cached:0,path:cUri,type:'css'});
            module.deps.push(mcss);
            loadUris.push(cUri);
        }
    } else {
        var deps = this._getDependenciesInCode(module.content),
            depsInCfg = this._getCfgDeps(module.alias);

        deps = deps.concat(depsInCfg);

        for(var i = 0; i < deps.length; i++){
            var refUri = i >= (deps.length - depsInCfg.length)?undefined:module.uri,
                aliasName = deps[i],
                uri = this._parseAliasToUri(aliasName,refUri),
                m = this._saveModule({uri:uri,cached:0,alias:aliasName});

            module.deps.push(m);
            loadUris.push(uri);
        }
    }
    
    for(var u = 0; u < loadUris.length; u++){
        this._loadFileByUri(loadUris[u]);
    }
    this._saveModule(module);
};

/**
从加载器配置中获取aliasName对应的模块的依赖信息
@method _getCfgDeps
@private
@param {String} aliasName 模块名称(别名)
@return {Array} 加载配置中aliasName对应的模块信息
**/
Deps.prototype._getCfgDeps = function(aliasName){
    var cfg = this._getLoaderCfg(),
        alias = cfg.alias || {},
        preload = cfg.preload || [];
    if(alias[aliasName] && alias[aliasName].requires){
        return alias[aliasName].requires;
    }

    if(aliasName === '__root__preload'){
        //console.log('__root__preload:',cfg.preload);
        var _preload = [],
            excludeHash = this._getExluceHash();
        for(var i = 0; i < preload.length; i++){
            if(!excludeHash[preload[i]]){
                _preload.push(preload[i]);
            }
        }
        return _preload;
    }

    return [];
};

/**
加载依赖文件以字符串保存在loadedFiles hash中
@method _loadFileByUri
@private
@param {String} uri 需要加载的文件uri
@return {Object} uri对应的模块信息
**/
Deps.prototype._loadFileByUri = function(uri){
    //console.log('加载状态:',this._moduleStatus(uri),uri);

    if(this._moduleStatus(uri) !== 0){
        return this._moduleCache[uri];
    }
    
    var self = this,
        currentModule;

    currentModule = this._saveModule({uri:uri,cached:1});
    //console.log('尝试读取文件:',uri);
    util.getFileContent(uri,function(data){
        self._saveFile(uri,data);
    });
    return currentModule;
};

/**
保存文件到loadedFiles中
@method _saveFile
@private
@param {String} uri 需要保存的模块的uri
@param {Object} data 需要保存的模块的内容
**/
Deps.prototype._saveFile = function(uri,data){
    //保存前获取所有依赖并且发起文件获取请求
    var content = data.toString(),
        i,subUri,
        currentModule;

    if(util.isCss(uri)){
        currentModule = this._saveModule({uri:uri,cached:2,content:util.removeComments(content),path:uri,type:'css',isSeajsModule:false});
    } else {
        var _content = util.removeComments(content);
        currentModule = this._saveModule({uri:uri,cached:2,content:_content,path:uri});
    }
    //console.log('_saveFile:',currentModule);
    //console.log('模块加载完成:',currentModule.uri);
    this._appendDependenciesToModule(currentModule);
    this._checkLoadComplete();
};

/**
检查是否所有依赖都已加载完成
@method _checkLoadComplete
@private
**/
Deps.prototype._checkLoadComplete = function(){
    var isAllLoaded = true;

    for(var m in this._moduleCache){
        if(this._moduleCache.hasOwnProperty(m)){
            if(this._moduleCache[m].cached !== 2){
                //console.log('未加载的模块:',this._moduleCache[m].uri);
                isAllLoaded = false;
                break;
            }
        }
    }

    if(isAllLoaded){
        this._fileLoadCompleted();
    }
};

/**
所有依赖文件加载完成以后调用,将依赖信息转化成depInfo对象,传给加载完成回调函数
@method _fileLoadCompleted
@private
**/
Deps.prototype._fileLoadCompleted = function(){
    //console.log('依赖分析完成!');
    
    if(this._rootModules.length > 1){
        var last = this._rootModules.pop();
        if(last && last.uri === '__root__preload'){
            this._rootModules.unshift(last);
        } else{
            this._rootModules.push(last);
        }
    }

    if(this._onFinished){
        var depInfo = new DepInfo(this._appPath,this._rootModules);
        this._onFinished(depInfo);
    }

};
