/*
 * 加载器模块
 * author : zhengle.zl@alibaba-inc.com
 * version : 0-0-1
 */
/*
 *
 */
 
;(function(win,doc){

var EMPTY = function(){};

var _loaderId = "$E",    //加载器全局变量名称
    _cache = {},
    _config = {},
    head = doc.head,
    $ = win[_loaderId];


if(typeof DEBUG === 'undefined'){ DEBUG = true; }

if($){
    return;
}

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

//根据id(别名)从配置项中获取模块信息
function getModule(id){
    return _config.alias[id];
}

//获取(设置)模块加载缓存
//属性 cached属性 0:未加载 1:正在加载 2:已加载
function cache(id,info){
    var c = _cache[id];
    if(info){
        if(!c){
            _cache[id] = c = {};
        }
        shallowCopy(c,info);
    }
    return c;
}

//加载脚本
function load(id,callback){
    //console.log('load:',mod.path);
    var c = cache(id);
    if(c){
        if(c.cached === 2){ //模块已加载
            callback();
        } else { //模块正在加载
            c.cb.push(callback);
        }
    } else {
        c = cache(id,{cached:0,cb:[]});
        c.cb.push(callback);
        c.cached = 1;
        fetch(id,function(){
            c.cached = 2;
            c.cb.forEach(function(fn){
                fn();
            });
        });
    }
}

//拉取文件
function fetch(id,callback){
    var mod = getModule(id),
        url = mod.path || mod,
        type = mod.type || url.toLowerCase().split(/\./).pop().replace(/[\?#].*/, ''),
        n = doc.createElement(type === 'css'?'link':'script'),
        charset = mod.charset,
        plugin = $.plugin.get(url);
        
    if(plugin){
        plugin.exec(mod);
        callback();
        return;
    }
    
    if(charset){
        n.charset = mod.charset;
    }

    assetOnload(n, callback);

    if(type === 'js'){
        n.src = url;
        n.async = 'async';
    } else if(type === 'css'){
        n.rel = 'stylesheet';
        n.href = url;
    }
    head.appendChild(n);
}

function assetOnload(node,callback){
    if (node.nodeName === 'SCRIPT') {
        node.onload = node.onerror = node.onreadystatechange = function() {
            if (/loaded|complete|undefined/.test(node.readyState)) {
                node.onload = node.onerror = node.onreadystatechange = null;
                if (!DEBUG && node.parentNode) {
                    head.removeChild(node);
                }
                node = undefined;
                callback();
            }
        };
    } else {
        node.onload = node.onerror = function() {
            node.onload = node.onerror = null;
            node = undefined;
            callback();
        };
    }
}

//加载模块
function loadModules(arrId,callback){
    var ids,count;
    ids = typeof arrId === 'string'?[arrId]:arrId;
    count = ids.length;
    if(ids.length === 0){
        callback();
        return;
    }

    ids.forEach(function(id,index){
        var mod = getModule(id),
            loadCurrent =  function(){
                load(id,function(){
                    count--;
                    if(count === 0){
                        callback();
                    }
                });
            };
            
        if(!mod){
            if(DEBUG){ console.log('模块未定义:',id); }
            return;
        }
        if(mod.requires){
            loadModules(mod.requires,loadCurrent);
        } else {
            loadCurrent();
        }
    });
}

$ = function(deps,fn){
    var args = arguments,
        preload = _config.preload || [];
    if(typeof deps === 'string'){
        deps = [].slice.call(arguments);
        if(typeof deps[deps.length - 1] === 'function'){
            fn = deps.pop();
        }
    } else if(typeof deps === 'function') {
        fn = deps;
        deps = [];
    }

    fn = fn || EMPTY;
    loadModules(preload,function(){
        loadModules(deps,fn);
    });
};

$.config = function(cfg){
    for(var p in cfg){
        if(cfg.hasOwnProperty(p)){
            _config[p] = _config[p] || (cfg[p] instanceof Array?[]:{});
            shallowCopy(_config[p],cfg[p]);
        }
    }
    console.log(_config);
};

win[_loaderId] = $;

})(window,document);

/*插件扩展*/
;(function($){
    var _plugin = [];
    $.plugin = {
        add:function(o){
            _plugin.push(o);
        },
        get:function(url){
            for(var i = _plugin.length - 1; i >= 0; i--){
                var ret = typeof _plugin[i].rule === 'function'?
                    _plugin[i].rule(url):_plugin[i].rule.test(url);
                if(ret){
                    return _plugin[i];
                }
            }
        }
    };
})($E);
