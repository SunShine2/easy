/**
@author zhengxie.lj@taobao.com
@version 1-0-0
*/
/**
@module tools
**/
$.DataSource = $.Base.build('$.DataSource', {
    
    /**
    初始化DataSource

    @class $.DataSource
    @constructor
    @param {Object} options 配置参数
    @param {Function} option.ajax 异步请求配置
    @example
    
        var datasource = new $.DataSource({
            name: 'datasource',
            getTime: {
               url: 'ajax.php',
               method: 'POST',
               data: function(){
                   return {
                      clientTime: Date.now()
                   }
               },
               'default': function(){
                    return {
                        time: Date.now()
                    }
               }
            },
            getUser: {
                url: 'ajax.php?method=getUser',
                cachable: false,
                method: 'GET',
                data: {name: 'zhengxie'},
                'default': {
                    msg: 'Hello friend'
                }
            }
        });

        //可以再次指定数据获取顺序
        datasource.fetch({
            order: ['Local', 'Remote'],
            key: 'getTime',
            expiredTime: 5 * 1000
        }, function(e, data){
            console.log(data);
        });

    **/
    initializer: function(options){
        this.options = options || {};
        if(!this.name){
            throw new Error('the name property must be specified');
        }
        this.order = this.order || ['Remote', 'Local', 'Default'];
        this.services = {};
        for(var i = 0, l = this.order.length; i < l; i++){
            var name = this.order[i],
                module = $.DataSource.retrieve(name);
            if(module){
                module = new module({host: this});
            }
            this.services[name] = module;
        }
    },


    /**
    一个数组中存放的是某个接口的实现对象。该方法遍历数组，顺序执行接口对象的方法
    直到获取到数据为止。

    @method _step
    @private
    @param {Array} order 遍历数组
    @param {Object} options 接口函数参数
    @param {String} method 接口函数名称
    @param {Function} callback 回调函数
    **/
    _step: function(order, options, method, callback){
        var index = 0,
            self = this,
            action = function(){
                if(index > order.length){
                    callback && callback('EOF');
                    return;
                }
                var name = order[index],
                    service = self.services[name];
                if(!service){
                    index++;
                    action();
                }else{
                    service[method](options, function(e, result){
                        if(e){
                            index++;
                            action();
                        }else{
                            callback && callback(null, result, name, options.key);
                        }
                    });
                }
            };
        action();
    },
    /**
    获取数据，优先通过网络获取，如果网络获取失败，可以选择使用localStorage中的数据。
    如果缓存数据也没有，可以选择使用代码中的默认数据。

    @method fetch
    @param {Object} options 请求参数
    @param {Function} callback 回调函数
    **/
    fetch: function(options, callback){
        if(typeof options === 'string'){
            options = {key: options};
        }
        var self = this,
            itemOptions = this.options[options.key],
            order;

        if(!itemOptions){
            throw new Error("The request key `" + options.key + "` has not be defined.");
        }
        order = options.order || itemOptions.order || this.order;
        this._step(order, options, 'fetch', function(e, data, source, key){
            if(e){
                return callback(e);
            }
            self.trigger('fetch', {
                source: source,
                key: key,
                data: data,
                options: options,
                itemOptions: itemOptions
            });
            callback(null, data);
        });
    },

    /**
    根据key清除本地缓存数据

    @method clearItem
    @param {String} key 定义在options中的key
    **/
    clearItem: function(key){
        var localService = this.services["Locale"],
            itemKey = localService._formatKey({key: key});
    },

    /**
    更新服务器端数据到localStorage中

    @method updateCache
    @param {String} key 定义在options中的key
    **/
    updateCache: function(key){
        var remoteService = this.services["Remote"];
        remoteService.updateCache(key);
    }

}, null, {
    /**
    定义的数据来源模块
    @static
    @protected
    @property modules
    @type {Object}
    **/
    modules: {},
    /**
    注册一个数据来源模块

    @method register
    @param {String} name 模块名称
    @param {Object} module 模块类
    **/
    register: function(name, module){
        this.modules[name] = module;
    },
    /**
    通过`name`取出一个数据来源模块

    @method retrieve
    @param {String} name 模块名称
    @return {Object} 模块类
    **/
    retrieve: function(name){
        return this.modules[name];
    }
});


$.DataSource.Local = $.Base.build('$.DataSource.Local', {
    /**
    `$.DataSource.Local` 表示本地存储数据源
    @class $.DataSource.Local
    @constructor
    @protected
    **/
    initializer: function(options){
        this.host = options.host;
        var self = this;

        this.host.bind('update', function(e, p){
            if(self._getCachable(p.options)){
                self.save(self._formatKey(p.options), p.data);
            } 
        });
        this.host.bind('fetch', function(e, p){
            if(p.source !== 'Remote'){
                return;
            }
            if(self._getCachable(p.options)){
                self.save(self._formatKey(p.options), p.data);
            } 
        });
    },

    /**
    根据请求参数活动localStorage的key名

    @method _fromatKey
    @private
    @param {Object} options 请求参数
        @param {String} options.key 定义在DataSource中的key
    @return {String} 
    **/
    _formatKey: function(options){
        var itemOptions = this.host.options[options.key];
        return itemOptions.localKey || this.host.name + ':' + options.key;
    },

    /**
    根据请求参数判断是否自动存储到localStorage中

    @method _getCachale
    @private
    @params {Object} options 请求参数
    @return {Boolean} 是否需要缓存到localStorage中
    **/
    _getCachable: function(options){
        var cachable = options.cachable,
            itemOptions = this.host.options[options.key];
        if(cachable === undefined){
            cachable = itemOptions.cachable;
        }
        if(cachable !== undefined && !cachable){
            return false;
        }
        return true;
    },
    /**
    从本地存储中获取数据

    @method fetch
    @param {Object} options
    @param {Function} callback
    **/
    fetch: function(options, callback){
        
        var itemOptions = this.host.options[options.key],
            cachable = this._getCachable(options),
            expiredTime = options.expiredTime || itemOptions.expiredTime,
            key = this._formatKey(options),
            data,
            json;

        if(!cachable){
            return callback('LOCALSTORAGE_IGNORE');
        }

        data = localStorage.getItem(key);

        if(!data){
           return callback('NOT_EXIST');
        }else{
            try{
                json = JSON.parse(data);
                if(expiredTime && expiredTime < Date.now() - Number(json.timestamp)){
                    localStorage.removeItem(key);
                    return callback('EXPIRED', data);
                }
                return callback(null, json.data);
            }catch(err){
                localStorage.removeItem(key);
                callback(err);
            }
        }
    },
    /**
    保存数据到本地存储

    @method save
    @protected
    @param {String} 本地存储的key
    @param {Object} 需要保存的数据
    @return {Boolean} 是否保存成功
    **/
    save: function(key, data){
        try{
            var store = {
                timestamp: Date.now(),
                data: data
            }
            localStorage.setItem(key, JSON.stringify(store));
            return true;
        }catch(err){
            return false;
        }
    }
});
$.DataSource.register('Local', $.DataSource.Local);


$.DataSource.Remote = $.Base.build('$.DataSource.Remote', { 
    /**
    `$.DataSource.Remote` 表示本地存储数据源

    @class $.DataSource.Remote
    @constructor
    @protected
    **/
    initializer: function(options){
        this.host = options.host;
        this._timeout = 10000;

        var self = this;
        this.host.bind('fetch', function(e, p){
            if(p.source === 'Remote'){
                return;
            };
            var updateCache = p.options.updateCache;
            if(updateCache === undefined){
                updateCache = p.itemOptions.updateCache;
            }
            if(updateCache !== undefined && !updateCache){
                return;
            }
            var order = p.options.order || p.itemOptions.order;
            if(!order) {
                order = self.host.order;
            }
            if(order.indexOf('Remote') <= order.indexOf(p.source)){
                return;
            }
            self.updateCache(p.options);
        });
    },

    /**
    更新服务器端数据到localStorage中

    @method updateCache
    @protected
    @param {Object} options 请求参数
    **/
    updateCache: function(options){
        var self = this;
        if(typeof options === 'string'){
            options = {key: options};
        }
        this.fetch(options, function(e, data){
            if(!e && data){
                self.host.trigger("update", {
                    key: options.key,
                    options: options,
                    itemOptions: self.host.options[options.key],
                    data: data
                });
            }
        });
    },
    /**
    从远程获取数据

    @method fetch
    @param {Object} options 请求参数
    @param {Function} callback 回调函数
    **/
    fetch: function(options, callback){

        
        var itemOptions = this.host.options[options.key],
            method = options.method,
            timeout = this._timeout,
            data = options.data,
            url = options.url || itemOptions,
            netFunction = options.netFunction || itemOptions.netFunction;

        netFunction = netFunction || this.host.netFunction;

        if(netFunction){
            if(!netFunction()){
                return callback('NET_ERROR');
            }
        }

        if(typeof url == 'object'){
            url = itemOptions.url;
            method = method || itemOptions.method;
            timeout = timeout || itemOptions.timeout;
            data = data || itemOptions.data;
        }
        if($.type(data) == 'function'){
            data = data();
        }

        function success(data){
            callback(null, data);
        };
        function error(err){
            callback(err || "ERROR");
        };
        if(this.host.ajax){
            this.host.ajax(url, method, data, success, error);
        }else{
            this.ajax(url, method, data, success, error);
        }
    },
    /**
    发出异步请求

    @method ajax
    @protected
    @param {String} url 请求地址
    @param {String} method 请求的方法, `GET`或`POST`
    @param {Object} params 请求参数
    @param {Function} success 正常的回调
    @param {Function} error 出错时的回调
    **/
    ajax: function(url, method, params, success, error){
        $.ajax({
            url: url,
            type: method,
            data: params,
            timeout: this._timeout,
            success: success,
            error: error
         });
    }
});
$.DataSource.register('Remote', $.DataSource.Remote);


$.DataSource.Default = $.Base.build('$.DataSource.Default', { 
    /**
    `$.DataSource.Default` 表示本地存储数据源

    @class $.DataSource.Default
    @constructor
    @protected
    **/
    initializer: function(options){
        this.host = options.host;
    },
    /**
    根据key从代码中获取默认的数据

    @method fetch
    @param {Object} options 请求参数
    @param {Function} callback 回调函数
    **/
    fetch: function(options, callback){
        var itemOptions = this.host.options[options.key],
            data =  options["default"] || itemOptions["default"];
        if(data){
            if($.type(data) == 'function'){
                data = data();
            }
            callback(null, data);
        }else{
            callback('UNDEFINED');
        }
    }
});
$.DataSource.register('Default', $.DataSource.Default);