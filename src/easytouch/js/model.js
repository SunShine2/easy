/**
 * EasyTouch Model
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module EasyTouch-Model
 */
;(function(){
    var
        /**
         * 数据请求返回数据没有通过`validate`方法时
         * @event dataerror
         * @param {Object} e event object from custom-event
         */
            EVN_DATA_ERROR = 'dataerror',
        /**
         * 数据保存后促发
         * @event save
         * @param {Object} e event object from custom-event
         * @param {Any} data the data after save
         */
            EVN_SAVE = 'save',
        /**
         * 数据变化后促发，调用`set`方法后
         * @event change
         * @param {Object} e event object from custom-event
         * @param {Any} data the data after change
         */
            EVN_CHANGE = 'change',
        /**
         * 数据重置后促发
         * @event reset
         * @param {Object} e event object from custom-event
         * @param {Any} data the data after reset
         */
            EVN_RESET = 'reset',
        /**
         * 数据删除后促发
         * @event remove
         * @param {Object} e event object from custom-event
         */
            EVN_REMOVE = 'remove',
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
     $.EasyTouch.Model，MVC中的Model模块，可以独立于EasyTouch运行

         var Address = $.EasyTouch.Model.extend({
            server: {
                url: 'center/address/info/'
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

     @class $.EasyTouch.Model
     @extends $.Base
     @constructor
     **/
    $.EasyTouch.Model = $.Base.build('$.EasyTouch.Model', {
        /**
         * EasyTouch.ModelList的集合，当前model所属ModelList的集合
         * @property lists
         * @type Array
         */
        lists: [],
        /**
         * [需要重写]默认的model数据
         * @property defaults
         * @type Any
         */
        defaults: undefined,
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
         * @type Any
         */
        data: undefined,
        /**
         * 对`$.EasyTouch.Model.prototype`的引用
         * @property super
         * @type Object
         */
        super: $.EasyTouch.Model,
        /**
         * Base模块的构造函数
         * @method initializer
         * @param data
         * @private
         */
        initializer: function(data){
            data = data || this.defaults;
            this.reset(data);
            this.init(data);
        },
        /**
         * [需要重写]作为model实例化时的构造函数
         * @method init
         * @param {Object} data 实例化时的参数
         */
        init: function(data){},
        /**
         * 修改model中某一个属性
         *
         *      this.set('name', 'youxiao');
         *
         *      this.set({
         *          name: 'youxiao',
         *          age: 26
         *      });
         *
         * @method set
         * @param {Object|String} key 属性名
         * @param {Any} value 属性值
         * @chainable
         */
        set: function(key, value){
            var _this = this;
            if(typeof key === 'object'){
                $.each(key, function(k, v){
                    _this.data[k] = v;
                });
            }else{
                this.data[key] = value;
            }
            this.trigger(EVN_CHANGE, this.clone());
            return this;
        },
        /**
         * 获取model中的某一个属性
         *
         *      //model: {name: {firstName: 'Qi', lastName: 'Zhou'}, age: 26}
         *      this.get('name');            //{firstName: 'Qi', lastName: 'Zhou'}
         *      this.get('name.firstName');  //Qi
         *
         * @method get
         * @param {String} key 属性名
         */
        get: function(key){
            var result = this.data;
            key.split('.').forEach(function(item){
                result = result[item];
            });
            return result;
        },
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
         * 监听指定数据的变化，在异步请求返回后执行，用于记录当前`page`等数据，需要监听的数据设置在`watchs`属性上
         * @method _watch
         * @param {Object} data
         * @return {Array}
         * @private
         * @chainable
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
            return this;
        },
        /**
         * 复制一个对象或者数组，默认复制`model.data`
         * @method clone
         * @param {Any} data 需要被复制的目标
         * @return {Any} 数据的拷贝
         */
        clone: function(data){
            data = data || this.data;
            var type = $.type(data);
            if(type === 'array'){
                return [].concat(data);
            }else if(type === 'object'){
                return $.extend({}, data);
            }else{
                return data;
            }
        },
        /**
         * 返回model中保存的数据
         * @method toJSON
         * @return {Any} 数据的拷贝
         */
        toJSON: function(){
            return this.clone();
        },
        /**
         * 把model保存到服务端
         *
         *      this.save({
         *          url: xxx,
         *          data: {},
         *          ...
         *      }, {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method save
         * @param {Object} options 和`$.ajax`的`options`参数一致，该参数将和`model.server`参数进行`extend`作为最终的请求参数
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        save: function(options, settings){
            settings = settings || {};
            var _this = this,
                _success = settings.success;
            settings.success = function(){
                _this.trigger(EVN_SAVE, this.clone());
                _success && _success.apply(this, arguments);
            };
            this.ajax(options, settings);
            return this;
        },
        /**
         * 删除model，并同步到server
         *
         *      this.remove({
         *          url: xxx,
         *          data: {},
         *          ...
         *      }, {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method remove
         * @param {Object} options 和`$.ajax`的`options`参数一致，该参数将和`model.server`参数进行`extend`作为最终的请求参数
         * @param {Object} settings
         *      @param {Function} settings.success 成功的回调
         *      @param {Function} settings.error 失败的回调
         * @chainable
         */
        remove: function(options, settings){
            settings = settings || {};
            var _this = this,
                _success = settings.success;
            settings.success = function(){
                _this.destroy();
                _this.trigger(EVN_REMOVE);
                _success && _success.apply(this, arguments);
            };
            this.ajax(options, settings);
            return this;
        },
        /**
         * 从服务端获取数据，重置本地数据
         *
         *      this.fetch({
         *          url: xxx,
         *          data: {},
         *          ...
         *      }, {
         *          success: function(){},
         *          error: function(){}
         *      })
         *
         * @method fetch
         * @param {Object} options 和`$.ajax`的`options`参数一致，该参数将和`model.server`参数进行`extend`作为最终的请求参数
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
         *      this.reset({
         *          name: 'youxiao',
         *          age: 25
         *      }, {
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
            this.data = data;
            this.trigger(EVN_RESET, this.clone());
            settings.success && settings.success.apply(this);
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
         *      this.clear({
         *          silent: true
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
            settings = settings || {};
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
            console.log('[$.EasyTouch.Model][ajax]: ' + _options.url);
            $.ajax(_options);

            return this;
        },
        /**
         * 销毁当前model，并从它的容器modellist中移除该项
         * @method destroy
         */
        destroy: function(){
            var _this = this;
            this.lists.forEach(function(list){
                list.remove(_this);
            });
        }
    },
    {

    },
    {
        /**
         * 通过该方法扩展一个`$.EasyTouch.Model`
         *
         *      var Model = $.EasyTouch.Model.extend({
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
         * @param {property} property 需要扩展到`$.EasyTouch.Page`上的方法和属性
         * @return {Function} 扩展出来的类
         * @static
         */
        extend: function(property){
            property.super = $.EasyTouch.Model.prototype;
            var child = $.Base.extend('$.EasyTouch.Model', this, property);
            child.extend = this.extend;
            return child;
        }
    });
})();