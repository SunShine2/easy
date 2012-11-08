/**
 * EasyTouch
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module EasyTouch
 * @submodule EasyTouch-View
 */
;(function(){
    var DelegateEvents = function(){};
    DelegateEvents.prototype.delegateEvents = function(events){
        if (!events){
            return this;
        }
        var _this = this;
        this.undelegateEvents();
        $.each(events, function(selector, methods){
            $.each(methods, function(type, handle){
                if (typeof handle !== 'function'){
                    handle = _this[handle];
                }
                var proxyfn = function(e){
                    handle.apply(_this, [e, this]);
                };
                type += '.delegateEvents' + _this.id;
                if (selector === '') {
                    _this.$el.bind(type, proxyfn);
                } else {
                    _this.$el.delegate(selector, type, proxyfn);
                }
            });
        });
        return this;
    };
    DelegateEvents.prototype.undelegateEvents = function() {
        this.$el.unbind('.delegateEvents' + this.id);
        return this;
    };

    /**
         var App = $.EasyTouch.extend({
         });

         new App();

     @class $.EasyTouch.View
     @extends $.Base
     @constructor
     **/
    $.EasyTouch.View = $.Base.build('$.EasyTouch.View', {
        /**
         * View的id
         * @property id
         * @type String
         * @optional
         */
        id: undefined,
        /**
         * View的容器
         * @property container
         * @type String|Node|HTMLElement
         */
        container: undefined,
        /**
         * View的模版
         * @property tpl
         * @type String
         * @optional
         */
        tpl: undefined,
        /**
         * 代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
         *
         *      {
         *          '#contariner header': {
         *              tap: 'nav',
         *          },
         *          '#contariner': {
         *              tap: function(){}
         *          }
         *      }
         *
         * @property events
         * @type Object
         * @optional
         */
        events: {},
        /**
         * View的dom容器
         * @property el
         * @type HTMLElement
         */
        el: undefined,
        /**
         * View的$dom容器
         * @property $el
         * @type Node
         */
        $el: undefined,
        /**
         * 对`$.EasyTouch.View.prototype`的引用
         * @property super
         * @type Object
         */

        initializer: function(options){
            $.extend(this, options || {});
            this.id = this.id || ('$.EasyTouch.View.' + new Date().getTime());
            this.app.log('[EasyTouch.View] '+this.id+' initializer', arguments);
            var container = this.container;
            if(container.tagName){
                this.$el = $(container);
                this.el = container;
            //$('div') zepto is $.zepto.Z / jquery is $
            }else if(container instanceof $ || container instanceof $.zepto.Z){
                this.$el = container;
                this.el = container[0];
            //'.list li' or '<li class="xxx"></li>'
            }else{
                this.$el = $(container);
                this.el = this.$el[0];
            }
            this.delegateEvents(this.events);
            this.init(options);
        },
        /**
         * 初始化时自动执行
         * @method init
         */
        init: function(){
            this.app.log('[EasyTouch.View] '+this.id+' init', arguments);
        },
        /**
         * 模版渲染，默认使用mustache
         * @method render
         * @chainable
         */
        render: function(){
            if(window.Mustache){
                this.$el.html(Mustache.to_html(this.tpl, this.model.toJSON()));
            }
            return this;
        },
        /**
         * 销毁该页面
         * @method destroy
         */
        destroy: function(){
            this.undelegateEvents();
            this.$el.remove();
        }
        /**
         * 在当前页面显示加载中提示
         * @method showLoading
         * @param {Object} options
         *      @param {String} options.msg 需要显示的文案
         *      @param {Boolean} options.modal 加载中提示是否覆盖住应用禁止操作
         * @chainable
         */
    },{
        /**
         * EasyTouch.Model的实例
         * @attribute model
         * @type Object
         * @optional
         */
        model: undefined,
        /**
         * EasyTouch.Page的实例，该view所属page的引用
         * @attribute page
         * @type Object
         * @optional
         */
        page: undefined,
        /**
         * EasyTouch实例，该view所属app的引用
         * @attribute app
         * @type Object
         * @optional
         */
        app: undefined
    },{
        /**
         通过该方法来继承并扩展一个`$.EasyTouch.View`：

         var View1 = $.EasyTouch.View.extend({
                 events: {
                     'header': {
                        tap: 'tapHeader',
                     }
                     '.back': {
                        tap: this.app.pageBack
                     }
                 },
                 init: function(){

                 },
                 tapHeader: function(e, sender){

                 }
             });

         @method $.EasyTouch.View.extend
         @param {Object} property property or function add to `$.EasyTouch.View`
         @return {Function} the new Class extended from `$.EasyTouch.View`
         @static
         **/
        extend: function(property){
            property.super = $.EasyTouch.View.prototype;
            var child = $.Base.extend('', this, property);
            child.extend = this.extend;
            return child;
        }
    });
    $.extend($.EasyTouch.View.prototype, DelegateEvents.prototype);
})();