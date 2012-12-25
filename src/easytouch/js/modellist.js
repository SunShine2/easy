/**
 * EasyTouch ModeList
 * @author: youxiao@alibaba-inc.com
 * @version: 0-0-1
 * @module EasyTouch-ModelList
 */
;(function(){
    var
        _Model = $.EasyTouch.Model,
        /**
         * 数据请求返回数据没有通过`validate`方法时
         * @event dataerror
         * @param {Object} e event object from custom-event
         */
            EVN_DATA_ERROR = 'dataerror',
        /**
         * Model被创建时促发
         * @event create
         * @param {Object} e event object from custom-event
         * @param {Any} model the created model
         */
            EVN_CREATE = 'create',
        /**
         * 数据添加后促发
         * @event add
         * @param {Object} e event object from custom-event
         * @param {Array} models the added models
         */
            EVN_ADD = 'add',
        /**
         * 数据移除后促发
         * @event remove
         * @param {Object} e event object from custom-event
         * @param {Array} models the models be removed
         */
            EVN_REMOVE = 'remove',
        /**
         * 数据变化后促发
         * @event change
         * @param {Object} e event object from custom-event
         * @param {Array} data the models after change
         */
            EVN_CHANGE = 'change',
        /**
         * 数据重置后促发，调用`fetch`和`reset`方法
         * @event reset
         * @param {Object} e event object from custom-event
         * @param {Array} data the models after reset
         */
            EVN_RESET = 'reset',
        /**
         * 数据请求前促发，参数说明：http://api.jquery.com/jQuery.ajax/
         * @event beforeSend
         * @param {Object} e event object from custom-event
         * @param {Object} jqXHR
         * @param {Object} settings
         */
            EVN_REQUEST_BEFORESEND = 'beforeSend',
        /**
         * 数据请求成功时促发，与Zepto、jQuery的success的区别在于这里不光请求成功了，而且通过了`validate`的检验，参数说明：http://api.jquery.com/jQuery.ajax/
         * @event success
         * @param {Object} e event object from custom-event
         * @param {Object} data
         * @param {String} textStatus
         * @param {Object} jqXHR
         */
            EVN_REQUEST_SUCCESS = 'success',
        /**
         * 数据请求完成时促发，参数说明：http://api.jquery.com/jQuery.ajax/
         * @event complete
         * @param {Object} e event object from custom-event
         * @param {Object} jqXHR
         * @param {String} textStatus
         */
            EVN_REQUEST_COMPLETE = 'complete',
        /**
         * 数据请求失败时促发，参数说明：http://api.jquery.com/jQuery.ajax/
         * @event error
         * @param {Object} e event object from custom-event
         * @param {Object} jqXHR
         * @param {String} textStatus
         * @param {Object} errorThrown
         */
            EVN_REQUEST_ERROR = 'error';

    /**
     $.EasyTouch.ModelList，MVC中的ModelList模块，可以独立于EasyTouch运行，但依赖于$.EasyTouch.Model

            var Address = $.EasyTouch.Model.extend({
                ...
            });
            var AddressList = $.EasyTouch.Model.extend({
                model: Address,
                server: {
                    url: 'center/address/list/'
                },
                watch: {
                    page: 'data.currentPage'
                },
                init: function(){

                },
                parse: function(json){
                    return json.data;
                },
                validate: function(json){
                    return json.code === 200;
                }
            });
            new AddressList().fetch();

     @class $.EasyTouch.ModelList
     @extends $.Base
     @constructor
     **/
    $.EasyTouch.ModelList = $.Base.build('$.EasyTouch.ModelList', {
        /**
         * [需要重写]ModelList对应的Model实例
         * @property model
         * @type Object
         */
        model: undefined,
        /**
         * [需要重写]用于异步请求的参数，和`$.ajax`(http://zeptojs.com/#$.ajax)的参数一致，在扩展一个`Model`时可以事先定义一份基础的请求参数
         *
         *      {
         *          url: xxx,
         *          type: 'POST',
         *          data: xxx
         *          ...
         *      }
         *
         * @property server
         * @type Object
         */
        server: {},
        /**
         * [需要重写]监听指定数据的变化，在异步请求返回后执行，用于记录当前`page`等数据，当数据返回后，以下面的设置为例：将从数据中的`data.data.currentPage`下查询该参数，并记录到`attrs`属性中
         *
         *      $.EasyTouch.Model.extend({
         *          watch: {
         *              page: 'data.currentPage'
         *          }
         *      });
         *
         *      var page = this.attrs.page;
         *
         * @property watch
         * @type Object
         */
        watch: {},
        /**
         * 存储的各类属性
         * @property attrs
         * @type Object
         */
        attrs: {},
        /**
         * 存储的数据
         * @property data
         * @type any
         */
        data: [],
        /**
         * 对`$.EasyTouch.Model.prototype`的引用
         * @property super
         * @type Object
         */
        /**
         * [需要重写]处理异步返回的数据，默认原样返回
         *
         *      $.EasyTouch.Model.extend({
         *          parse: function(data){
         *              return data.items
         *          }
         *      });
         *
         * @method parse
         * @param {Object} data
         * @return {Any}
         */
        parse: function(data){
            return data;
        },
        /**
         * [需要重写]检查异步返回的数据，默认返回`true`
         *
         *      $.EasyTouch.Model.extend({
         *          validate: function(data){
         *              return !!data.success
         *          }
         *      });
         *
         * @method parse
         * @param {Object} data
         * @return {Boolean}
         */
        validate: function(data){
            return true;
        },
        /**
         * Base模块的构造函数
         * @method initializer
         * @param data
         * @private
         */
        initializer: function(data){
            this.model = this.model || _Model;
            if($.type(data) === 'array'){
                this.reset(data);
            }
            this.init(data);
        },
        /**
         * [需要重写]作为ModelList实例化时的构造函数
         * @method init
         * @param {Object} data 实例化时的参数
         */
        init: function(data){},
        /**
         * 监听指定数据的变化，在异步请求返回后执行，用于记录当前`page`等数据，需要监听的数据设置在`watchs`属性上
         * @method _watch
         * @param {Object} data
         * @return {Array}
         * @private
         */
        _watch: function(data){
            var _this = this;
            $.each(_this.watch, function(key, value){
                var _value;
                value.split('.').forEach(function(item){
                    _value = _value?_value[item]:data[item];
                });
                _this.attrs[key] = _value;
            });
        },
        /**
         * 类似数组的`every`方法
         *
         *      var youxiao = {
         *          name: 'youxiao',
         *          age: 25,
         *          sex: male
         *      };
         *
         *      var isYouxiao = this.every({
         *          name: 'youxiao',
         *          age: 25
         *      }, function(k, v){
         *          return youxiao[k] === v;
         *      });
         *
         * @method every
         * @param {Object} attrs
         * @param {Object} callback
         * @return {Boolean}
         */
        every: function(attrs, callback){
            var r = true;
            $.each(attrs, function(k, v){
                if(!callback(k, v)){
                    r = false;
                    return false;
                }
            });
            return r;
        },
        /**
         * 查询`model.data`中符合条件的数据，查询对象必须是一个对象组成的数组
         *
         *      this.where({name: 'youxiao'});
         *
         * @method where
         * @param attrs 条件列表
         * @return {Array}
         */
        where: function(attrs){
            var _this = this,
                result = [];
            this.data.forEach(function(item){
                var data = item.toJSON();
                var r = _this.every(attrs, function(k, v){
                    return data[k] === v;
                });
                if(r){
                    result.push(item);
                }
            });
            return result;
        },
        /**
         * 获取modellist的数据
         * @method toJSON
         * @param {Array} [models] 默认为当前的modellist，可以传递一个model组成的数组
         * @return {Array} ModelList
         */
        toJSON: function(models){
            var data = [];
            models = models || this.data;
            models.forEach(function(item){
                data.push(item.toJSON());
            });
            return data;
        },
        /**
         * 获取下一页数据
         *
         *      this.next({
         *          data: {
         *              page: 2
         *          }
         *      },{
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method next
         * @param {Object} options 和`$.ajax`的`options`参数一致，该参数将和`model.server`参数进行`extend`作为最终的请求参数
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        next: function(options, settings){
            var _this = this;
            settings = settings || {};
            var _success = settings.success;
            settings.success = function(data){
                _this._watch(data);
                settings.success = _success;
                _this.add(_this.parse(data), settings);
            };
            this.ajax(options, settings);
            return this;
        },
        /**
         * 添加数据
         *
         *      this.add([
         *          {
         *              name: 'youxiao',
         *              age: 25
         *          }
         *      ], {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method add
         * @param {ModelList|Model|Array|Object} data
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        add: function(data, settings){
            var _this = this;
            settings = settings || {};
            if($.type(data) !== 'array'){
                data = [data];
            }
            data = data.map(function(item){
                if(!(item instanceof _Model)){
                    item = new _this.model(item);
                    _this.trigger(EVN_CREATE, item);
                    if(item.lists.indexOf(_this) === -1){
                        item.lists.push(_this);
                    }
                }
                return item;
            });
            this.data = this.data.concat(data);
            this.trigger(EVN_ADD, data);
            this.trigger(EVN_CHANGE, this.data);
            settings.success && settings.success.call(this, data);
            return this;
        },
        /**
         * 从服务端获取数据，重置本地数据
         *
         *      this.fetch({
         *
         *      }, {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method fetch
         * @param {Array} options 和`$.ajax`的`options`参数一致，该参数将和`model.server`参数进行`extend`作为最终的请求参数
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        fetch: function(options, settings){
            settings = settings || {};
            var _this = this,
                _success = settings.success;
            settings.success = function(data){
                _this._watch(data);
                settings.success = _success;
                _this.reset(_this.parse(data), settings);
            };
            this.ajax(options, settings);
            return this;
        },
        /**
         * 用已有的数据重置本地数据
         *
         *      this.reset([
         *          {
         *              name: 'youxiao',
         *              age: 25
         *          }
         *      ], {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method reset
         * @param {Array} data
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        reset: function(data, settings){
            settings = settings || {};
            var _this = this;
            data = data.map(function(item){
                if(!(item instanceof _Model)){
                    item = new _this.model(item);
                    _this.trigger(EVN_CREATE, item);
                    if(item.lists.indexOf(_this) === -1){
                        item.lists.push(_this);
                    }
                }
                return item;
            });
            this.data = data;
            this.trigger(EVN_RESET, data);
            this.trigger(EVN_CHANGE, data);
            settings.success && settings.success.call(this, data);
            return this;
        },
        /**
         * 调用`$.ajax'前，处理`$.ajax'的`options`参数，可以用来给url添加域名，给`options.data`增加通用参数等
         *
         *      parseAjaxOptions: function(options){
         *          options.url = 'http://taobao.windcache.com/' + options.url;
         *          return options;
         *      }
         *
         * @method parseAjaxOptions
         * @param {Object} options 和`$.ajax`的`options`参数一致
         * @return {Object} 处理完后的`options`参数
         */
        parseAjaxOptions: function(options){
            return options;
        },
        /**
         * 封装过的`$.ajax`
         *
         *      this.ajax({
         *
         *      }, {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method ajax
         * @param {Object} options 和`$.ajax`的`options`参数一致
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        ajax: function(options, settings){
            var _this = this,
                defaultOptions = $.extend({
                    data: {},
                    type: 'GET',
                    dataType: 'json'
                }, _this.server),
                _options = this.parseAjaxOptions($.extend(defaultOptions, options)),
                success = _options.success,
                error = _options.error,
                beforeSend = _options.beforeSend,
                complete = _options.complete,
                _success = settings.success,
                _error = settings.error;

            _options.success = function(data, textStatus, jqXHR){
                success && success.apply(this, arguments);
                if(!_this.validate(data)){
                    _this.trigger(EVN_DATA_ERROR, data, textStatus, jqXHR);
                    _error && _error.apply(_this, arguments);
                    return;
                }
                _this.trigger(EVN_REQUEST_SUCCESS, data, textStatus, jqXHR);
                _success && _success.apply(_this, arguments);
            };
            _options.error = function(jqXHR, textStatus, errorThrown){
                error && error.apply(this, arguments);
                _this.trigger(EVN_REQUEST_ERROR, jqXHR, textStatus, errorThrown);
                _error && _error.apply(_this, arguments);
            };
            _options.beforeSend = function(jqXHR, settings){
                beforeSend && beforeSend.apply(this, arguments);
                _this.trigger(EVN_REQUEST_BEFORESEND, jqXHR, settings);
            };
            _options.complete = function(jqXHR, textStatus){
                complete && complete.apply(this, arguments);
                _this.trigger(EVN_REQUEST_COMPLETE, jqXHR, textStatus);
            };

//                if(/^https?:\/\//.test(_options.url)){
//                    if(_options.type.toUpperCase() === 'GET'){
//                        _options.url += '?';
//                        var pArr = [];
//                        $.each(_options.data, function(key, value){
//                            pArr.push(key+'='+encodeURIComponent(value));
//                        });
//                        _options.url += pArr.join("&");
//                        _options.data = {};
//                    }
//            if(halo.mobile){
//                _options.url = navigator.app.wrapAjaxUrl(_options.url);
//            }else{
//                _options.url = '/proxy/' + _options.url;
//            }
//                }

            $.ajax(_options);

            return this;
        },
        /**
         * 移除`modellist.data`中的一项或多项
         *
         *      this.remove()      //remove all models
         *      this.remove(model) //remove one model
         *      this.remove([model1, model2]) //remove some model
         *
         * @method remove
         * @param {Array|Object} [targets]
         * @chainable
         */
        remove: function(targets){
            var _this = this,
                popList = targets;
            if(targets === undefined){
                popList = [].concat(this.data);
                this.data = [];
            }else{
                if($.type(targets) !== 'array'){
                    targets = [targets];
                }
                targets.forEach(function(item){
                    _this.data = _this.data.filter(function(_item){
                        return item !== _item;
                    });
                });
            }
            this.trigger(EVN_REMOVE, popList);
            this.trigger(EVN_CHANGE, this.data);
            return this;
        }
    },
    {

    },
    {
        /**
         * 通过该方法扩展一个`$.EasyTouch.ModelList`
         *
         *      var ModelList = $.EasyTouch.ModelList.extend({
         *          model: Model,
         *          server: {
         *              url: 'xxx',
         *              type: 'POST',
         *              data: {
         *                  id: 1,
         *                  sort: 'hongbao',
         *                  ...
         *              }
         *              ...
         *          },
         *          watch: {
         *              page: 'currentPage'
         *          },
         *          parse: function(){},
         *          validate: function(){}
         *      });
         *
         * @method extend
         * @param {property} property 需要扩展到`$.EasyTouch.ModelList`上的方法和属性
         * @return {Function} 扩展出来的类
         * @static
         */
        extend: function(property){
            property.super = $.EasyTouch.ModelList.prototype;
            var child = $.Base.extend('$.EasyTouch.ModelList', this, property);
            child.extend = this.extend;
            return child;
        }
    });
})();