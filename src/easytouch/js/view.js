/**
 * EasyTouch
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module EasyTouch-View
 */
;(function(){
    /**
     $.EasyTouch.View，MVC中的View模块，可以独立于EasyTouch运行

            var View = $.EasyTouch.View.extend({
                container: '<li></li>',
                events: {
                    '.et-del': {
                        tap: 'del'
                    }
                },
                init: function(){
                },
                del: function(e){
                }
            });
            new View();

     @class $.EasyTouch.View
     @extends $.Base
     @constructor
     **/
    $.EasyTouch.View = $.Base.build('$.EasyTouch.View', {
        /**
         * [需要重写]View的id
         * @property id
         * @type String
         * @optional
         */
        id: undefined,
        /**
         * [需要重写]View的容器
         * @property container
         * @type String|Node|HTMLElement
         */
        container: undefined,
        /**
         * [需要重写]EasyTouch.Model的实例，`render`方法默认使用这个model获取数据
         * @property model
         * @type Object
         * @optional
         */
        model: undefined,
        /**
         * [需要重写]View的模版，`render`方法默认使用这个作为模版
         * @property tpl
         * @type String
         * @optional
         */
        tpl: undefined,
        /**
         * [需要重写]代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
         *
         *      {
         *          '#contariner header': {
         *              tap: 'nav',
         *          },
         *          '#contariner': {
         *              tap: function(){}
         *          },
         *          //当选择器是空的时，为本身
         *          '': function(){
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
            this.id = this.id || ('$.EasyTouch.View.' + new Date().getTime());
            console.log('[EasyTouch.View] '+this.id+' initializer', arguments);
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
            console.log('[EasyTouch.View] '+this.id+' init', arguments);
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
         * 绑定事件，建议使用更方便的配置`events`属性的方式
         *
         *      view.delegateEvents({
         *          '#contariner': {
         *              tap: function(){}
         *          }
         *      });
         *
         * @method delegateEvents
         * @param {Object} events
         * @chainable
         */
        /**
         * 解绑所有事件
         * @method undelegateEvents
         * @chainable
         */
        /**
         * 销毁该页面
         * @method destroy
         */
        destroy: function(){
            this.undelegateEvents();
            this.$el.remove();
        }
    },{
    },{
        /**
         通过该方法来继承并扩展一个`$.EasyTouch.View`：

            var View = $.EasyTouch.View.extend({
                 tpl: xxx,
                 model: xxx,
                 events: {
                     '.back': {
                        tap: function(){}
                     }
                 },
                 init: function(){

                 }
                 ...
            });

         @method extend
         @param {Object} property property or function add to `$.EasyTouch.View`
         @return {Function} the new Class extended from `$.EasyTouch.View`
         @static
         **/
        extend: function(property){
            property.super = $.EasyTouch.View.prototype;
            var child = $.Base.extend('$.EasyTouch.View', this, property);
            child.extend = this.extend;
            return child;
        }
    });
    $.extend($.EasyTouch.View.prototype, $.EasyTouch.DelegateEvents);
})();