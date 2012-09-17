/**
 * EasyTouch
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module EasyTouch
 * @submodule EasyTouch-Model
 *
 */
;(function(){
var
    /**
     * 数据请求返回数据没有通过`validate`方法时
     * @event dataerror
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Object|String} params.data data from server
     */
    EVN_DATA_ERROR = 'dataerror',
    /**
     * 数据添加前促发
     * @event beforeadd
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Any} params.data the data that will be added
     */
    EVN_BEFORE_ADD = 'beforeadd',
    /**
     * 数据添加后促发
     * @event add
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Any} params.data the added data
     */
    EVN_ADD = 'add',
    /**
     * 数据变化前促发
     * @event beforechange
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Any} params.data the data before change
     */
    EVN_BEFORE_CHANGE = 'beforechange',
    /**
     * 数据变化后促发
     * @event change
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Any} params.data the data after change
     */
    EVN_CHANGE = 'change',
    /**
     * 数据重置前促发，调用`fetch`和`reset`方法
     * @event beforereset
     * @param {Object} e event object from custom-event
     * @param {Object} data data after reset
     */
    EVN_BEFORE_RESET = 'beforereset',
    /**
     * 数据重置后促发，调用`fetch`和`reset`方法
     * @event reset
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {Any} params.data the data after reset
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
     * 数据请求成功时促发，参数说明：http://api.jquery.com/jQuery.ajax/
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

$.EasyTouch.Model = $.Base.build('$.EasyTouch.Model', {
    cid: undefined,
    cache: false,
    /**
     * 用于异步请求的参数，和`$.ajax`的参数一致，在扩展一个`Model`时可以事先定义一份基础的请求参数
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
     * 监听指定数据的变化，在异步请求返回后执行，用于记录当前`page`等数据，当数据返回后，以下面的设置为例：将从数据中的`data.data.currentPage`下查询该参数，并记录到`attrs`属性中
     *
     *      $.EasyTouch.Model.extend({
     *          watch: {
     *              page: 'data currentPage'
     *          }
     *      });
     *
     *      var page = this.getAttr('page');
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
    data: undefined,
    /**
     * 处理异步返回的数据，默认原样返回
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
     * 检查异步返回的数据，默认返回`true`
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
    initializer: function(){
//        if(!this.cache){
//            this.cid = new Date().getTime();
//        }else{
//            this.cid = this.cache;
//            if(window.localStorage.getItem(this.cid)){
//                this.data = JSON.parse(window.localStorage.getItem(this.cid));
//            }
//        }
    },
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
            value.split(' ').forEach(function(item){
                _value = _value?_value[item]:data[item];
            });
            _this.setAttr(key, _value);
        });
    },
    /**
     * 获取`attrs`中保存的属性
     * @method getAttr
     * @param {String} key
     * @return {Any}
     */
    getAttr: function(key){
        return this.attrs[key];
    },
    /**
     * 设置`attrs`中的属性
     * @method setAttr
     * @param {String} key
     * @param {Any} value
     * @chainable
     */
    setAttr: function(key, value){
        this.attrs[key] = value;
        return this;
    },
    /**
     * 复制`data`
     * @method clone
     * @param {Any} data the data that to be cloned
     * @return the cloned data
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
     * 类似数组的`every`方法
     *
     *      var youxiao = {
     *          name: 'youxiao',
     *          age: 25
     *      };
     *
     *      var isYouxiao = this.every({
     *          name: 'youxiao',
     *          age: 25
     *      }, function(k, v){
     *          return youxiao[k] === v;
     *      });
     *
     *      if(isYouxiao){
     *          console.log('You are youxiao.');
     *      }
     *
     * @method some
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
     * 查询符合条件的数据
     *
     *      this.where({name: 'youxiao'});
     *
     * @method where
     * @param attrs
     * @return {Array}
     */
    where: function(attrs){
        var result = [],
            _this = this,
            data = this.data || [];
        data.forEach(function(item){
            var r = _this.every(attrs, function(k, v){
                return item[k] === v;
            });
            if(r){
                result.push(item);
            }
        });
        return result;
    },
    /**
     * 获取下一页数据
     *
     *      this.getNext({
     *          page: 2
     *      }, {
     *          silent: true
     *      })
     *
     * @method getNext
     * @param {Object} data data for ajax, this is as same as the `options.data` of `$.ajax`
     * @param {Object} options
     *      @param {Boolean} options.silent if trigger the evnets
     * @chainable
     */
    getNext: function(data, options){
        options = options || {};
        var _this = this;
        _this.server.data = $.extend(_this.server.data || {}, data);
        this.ajax({
            data: _this.server.data
        },function(data){
            _this.add(data, options);
        });
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
     *          silent: true
     *      })
     *
     * @method add
     * @param {Array} data
     * @param {Object} options
     *      @param {Boolean} options.silent if trigger the evnets
     * @chainable
     */
    add: function(data, options){
        options = options || {};
        var _this = this,
            silent = !!options.silent,
            previous = this.clone();
        if(!_this.validate(data)){
            !silent && _this.trigger(EVN_DATA_ERROR, {
                data: data
            });
            return this;
        }
        _this._watch(data);
        data = _this.parse(data);
        !silent && _this.trigger(EVN_BEFORE_CHANGE, {
            data: previous
        });
        !silent && _this.trigger(EVN_BEFORE_ADD, {
            data: data
        });
        if(!_this.data){
            _this.data = [];
        }
        _this.data.concat(data);
        !silent && _this.trigger(EVN_ADD, {
            data: _this.data
        });
        !silent && _this.trigger(EVN_CHANGE, {
            data: _this.data
        });
        return this;
    },
    /**
     * 从服务端数据，重置本地数据，即第一次请求数据时使用
     *
     *      this.fetch({
     *
     *      }, {
     *          silent: true
     *      })
     *
     * @method fetch
     * @param {Array} data data for ajax, this is as same as the `options.data` of `$.ajax`
     * @param {Object} options
     *      @param {Boolean} options.silent if trigger the evnets
     * @chainable
     */
    fetch: function(data, options){
        this.server.data = $.extend(this.server.data || {}, data || {});
        options = options || {};
        var _this = this;
        this.ajax({
            data: this.server.data
        },function(data){
            _this.reset(data, options);
        });
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
     *          silent: true
     *      })
     *
     * @method reset
     * @param {Array} data
     * @param {Object} options
     *      @param {Boolean} options.silent if trigger the evnets
     * @chainable
     */
    reset: function(data, options){
        if(!this.validate(data)){
            !silent && this.trigger(EVN_DATA_ERROR, {
                data: data
            });
            return this;
        }

        options = options || {};
        var _this = this,
            silent = !!options.silent,
            previous = this.clone();
        _this._watch(data);
        data = _this.parse(data);
        !silent && _this.trigger(EVN_BEFORE_RESET, {
            data: previous
        });
        !silent && _this.trigger(EVN_BEFORE_CHANGE, {
            data: previous
        });
        _this.data = data;
        !silent && _this.trigger(EVN_RESET, {
            data: data
        });
        !silent && _this.trigger(EVN_CHANGE, {
            data: data
        });
        return this;
    },
    /**
     * 清除`attrs`
     *
     *      this.clear({
     *          silent: true
     *      })
     *
     * @method clear
     * @param {Object} options
     *      @param {Boolean} options.silent if trigger the evnets
     * @chainable
     */
    clear: function(options){
        !options.silent && this.trigger(EVN_BEFORE_CHANGE, {
            data: this.clone()
        });
        this.attrs = {};
        delete this.data;
        !options.silent && this.trigger(EVN_CHANGE, {
            data: undefined
        });
        return this;
    },
    /**
     * 封装过的`$.ajax`
     *
     *      this.clear({
     *          silent: true
     *      })
     *
     * @method ajax
     * @param {Object} options as same as the `options` of `$.ajax`
     * @chainable
     */
    ajax: function(options, _success, _error){
        var _this = this,
            defaultOptions = $.extend({
                data: {},
                type: 'GET',
                dataType: 'json'
            }, _this.server),
            _options = $.extend(defaultOptions, options),
            success = _options.success,
            error = _options.error,
            beforeSend = _options.beforeSend,
            complete = _options.complete;

        _options.success = function(){
            _this.trigger(EVN_REQUEST_SUCCESS, Array.prototype.slice.call(arguments, 0));
            _success && _success.apply(this, arguments);
            success && success.apply(this, arguments);
        };
        _options.error = function(){
            _this.trigger(EVN_REQUEST_ERROR, Array.prototype.slice.call(arguments, 0));
            _error && _error.apply(this, arguments);
            error && error.apply(this, arguments);
        };
        _options.beforeSend = function(){
            _this.trigger(EVN_REQUEST_BEFORESEND, Array.prototype.slice.call(arguments, 0));
            beforeSend && beforeSend.apply(this, arguments);
        };
        _options.complete = function(){
            _this.trigger(EVN_REQUEST_COMPLETE, Array.prototype.slice.call(arguments, 0));
            complete && complete.apply(this, arguments);
        };

        if(/^https?:\/\//.test(_options.url)){
            if(_options.type.toUpperCase() === 'GET'){
                _options.url += '?';
                var pArr = [];
                $.each(_options.data, function(key, value){
                    pArr.push(key+'='+encodeURIComponent(value));
                });
                _options.url += pArr.join("&");
                _options.data = {};
            }
//            if(halo.mobile){
//                _options.url = navigator.app.wrapAjaxUrl(_options.url);
//            }else{
//                _options.url = '/proxy/' + _options.url;
//            }
        }

        $.ajax(_options);

        return this;
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
     * @param {property} property property or function add to `$.EasyTouch.Page`
     * @return {Function} the new Class extended from `$.EasyTouch.Page`
     * @static
     */
    extend: function(property){
        return $.Base.extend('', $.EasyTouch.Model, property);
    }
});
})();