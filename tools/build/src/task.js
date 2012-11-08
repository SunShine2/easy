/*
 * 依赖查找任务队列
 */

var fs = require('fs'),
    http = require('http'),
    path = require('path'),

    Deps = require('./deps'),
    util = require('./util');

exports = module.exports = Task;


/**
@module build
**/

/**
依赖任务类,组织或预处理待查找依赖的脚本和样式
@class Task
@constructor
@param {Object} cfg 应用的配置信息
@param {cheerio} $ 页面的dom结构
**/
function Task(cfg,$){
    this._appPath = '';
    this._codes = [];   //存放读取到的代码
    this._onfihisned = null;
    this._$ = $;
    this._appCfg = null;

    this._init(cfg);
    this._id = 0;
}

Task.prototype = {
/**
初始化依赖任务
@method _init
@private
@param {Object|String} 任务的配置信息,如果为string,则为应用的目录,对象则需要三个属性,appPath,scripts,codes
**/
    _init:function(cfg){
        if(typeof cfg === 'string'){
            this._appPath = cfg;
        } else if(typeof cfg === 'object') {
            this._appPath = cfg.appPath || '';

            if(cfg.scripts){
                cfg.appendScript(cfg.scripts);
            }
            if(cfg.codes){
                cfg.appendCode(cfg.codes);
            }
            if(cfg.appCfg){
                this._appCfg = cfg.appCfg;
            }
        }
    },

    setAppCfg: function(appCfg){
        this._appCfg = appCfg;
    },
/**
设置应用的目录
@method setAppPath
@param {String} strPath 应用所在的目录
**/
    setAppPath:function(strPath){
        this._appPath = strPath;
    },
/**
向任务中增加外联脚本
@method appendScript
@param {String|Array} src 需要增加的脚本地址
@param {String} 脚本的id
**/
    appendScript:function(src,uuid){
        var regJs = /.js$/,
            extend = regJs.test(src)?'':'.js',
            vals = typeof src === 'string'?[src]:src;

        for(var i = 0; i < vals.length; i++){
            this._codes.push({uri:vals[i] + extend,content:null,uuid:uuid});
        }
    },
/**
向任务中增加内联脚本
@method appendCode
@param {String|Array} codes 需要增加的脚本内容
@param {String} 脚本的id
**/
    appendCode:function(codes,uuid){
        var i,
            vals = typeof codes === 'string'?[codes]:codes;
        for(i = 0; i < vals.length; i++){
            this._codes.push({content:vals[i],uuid:uuid});
        }
    },
/**
向任务中增加外联less
@method appendLess
@param {String|Array} href 需要增加的脚本
@param {String} 脚本的id
**/
    appendCss:function(href,uuid){
        var i,
            vals = typeof href === 'string'?[href]:href;
        for(i = 0; i < vals.length; i++){
            this._codes.push({uri:href,type:'css',uuid:uuid,content:null});
        }
    },

/**
开始执行依赖任务
@method start
**/
    start:function(){
        var self = this,
            count = 0,
            hasPreLoad = false;
        for(var i = 0; i<this._codes.length; i++){
            if(this._codes[i].uri && this._codes[i].content === null){
                count++;
                hasPreLoad = true;
                var uri = this._codes[i].uri;
                if(!util.isHttp(uri)){
                    uri = path.join(this._appPath,uri);
                    this._codes[i].uri = uri;
                }
                util.getFileContent(uri,cb(this._codes[i]));
            }
        }

        if(!hasPreLoad){
            _start();
        }

        function cb(code){
            return function(data){
                code.content = data;
                count--;
                if(count === 0){
                    _start();
                }
            };
        }

        function _start(){
            console.log('任务初始化完成');
            var deps = new Deps({appPath:self._appPath,appCfg:self._appCfg},self._codes,self._$);
            /*
            deps.onFinished(function(info){
                if(self._onfihisned){
                    self._onfihisned(info);
                }
            });
            */

            deps.onFinished(self._onfihisned);
            deps.start();
        }
        
        
    },
/**
设置依赖任务执行完成以后的回调函数,需要在start前调用
@method finished
@param {Function} fn 任务执行完成以后的回调
**/
    finished:function(fn){
        this._onfihisned = fn;
    }
};

Task.prototype.constructor = Task;