/*依赖接口定义*/
var _deps = [];
var _config = {};

/**
@module build
**/

/**
加载器接口定义,用于获取加载器中的配置,依赖等信息
@class $E
**/

var $E = function(dependencies,fn){
    var args = arguments,
        deps = dependencies;
    if(typeof deps === 'string'){
        deps = [].slice.call(arguments);
        if(typeof deps[deps.length - 1] === 'function'){
            fn = deps.pop();
        }
    } else if(typeof deps === 'function') {
        fn = deps;
        deps = [];
    }

    _deps.push({deps:deps,factory:fn,isModuleDefine:true});
};

/**
初始化(清空)加载器的配置和依赖信息
@method init
@static
**/
$E.init = function(){
    _deps = [];
    _config = {};
};

/**
重置(清空)加载器的依赖信息
@method reset
@static
**/
$E.reset = function(){
    _deps = [];
};

/**
获取执行到某个阶段时依赖的模块信息
@method getDeps
@static
@return {Array} 依赖的模块信息
**/
$E.getDeps = function(){
    return _deps;
};
/**
获取加载器的配置信息(seed,userconfig)
@method getConfig
@static
@return {Object} 加载器的配置
**/
$E.getConfig = function(){
    return _config;
};

/**
定义加载器的config方法,保存加载器的配置信息
@method config
@static
@param {Object} cfg 配置信息
**/
$E.config = function(cfg){
    for(var p in cfg){
        if(cfg.hasOwnProperty(p)){
            _config[p] = _config[p] || (Array.isArray(cfg[p])?[]:{});
            shallowCopy(_config[p],cfg[p]);
        }
    }
};

$E.app = function(appCfg){
    var modules = appCfg.modules || [],
        requires = appCfg.requires || [],
        appRequires = [],
        appPath = appCfg.path,
        _alias = {},
        p,i;

    for(i = 0; i< modules.length; i++){
        p = modules[i];
        _alias[p] = {
            path: p,
            requires: requires
        };
        appRequires.push(p);
    }

    _alias['app'] = {
        path: appPath,
        requires:appRequires
    };

    $.config({
        alias:_alias
    });
};

exports.$E = $E;
exports.console = console;

exports.setTimeout = setTimeout;
exports.clearTimeout = clearTimeout;
exports.setInterval = setInterval;
exports.clearInterval = clearInterval;
exports.window = global;


var doc = {};
exports.document = doc;
exports.setDocument = function(doc){
    //TODO:设置document
    doc = doc;
};

function shallowCopy(obj1,obj2){
    if(obj2 instanceof Array){
        for(var i = 0; i < obj2.length; i++){
            obj1.push(obj2[i]);
        }
    } else {
        for(var p in obj2){
            if(obj2.hasOwnProperty(p)){
                obj1[p] = obj2[p];
            }
        }
    }
}

