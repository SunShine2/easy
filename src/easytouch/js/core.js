/**
 * EasyTouch
 * @author: youxiao@alibaba-inc.com
 * @version: 0-0-1
 * @module EasyTouch
 * @uses EasyTouch-Page
 * @review
 *  1. 建立一个Logger机制
 *  2. 监听backbutton事件，如果是在子应用可以回到父应用
 *
 */
define('easy-touch-core', ['base','css!easy-touch-style'], function ($) {

    $.EasyTouch = {
        Loading: {
            /**
             * 在`this.$el`中显示加载中提示
             * @method showLoading
             * @param {Object} options
             *      @param {String} options.msg 需要显示的文案
             *      @param {Boolean} options.modal 加载中提示是否覆盖住应用禁止操作
             * @chainable
             */
            showLoading: function(options){
                options = options || {};
                var msg = options.msg || '',
                    modal = !!options.modal,
                    className = CLASS_PREFIX+'load',
                    $load = this.$el.children('.'+className);
                if($load.length){
                    $load.text(msg).data('modal', modal).show();
                }else{
                    this.$el.append('<div class="'+className+'" data-modal="'+modal+'"></div>');
                }

                return this;
            },
            /**
             * 隐藏`this.$el`中的加载中提示
             * @method hideLoading
             * @chainable
             */
            hideLoading: function(){
                this.$el.children('.'+CLASS_PREFIX+'load').hide();
                return this;
            }
        },

        DelegateEvents: {
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
            delegateEvents: function(events){
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
            },
            /**
             * 解绑所有事件
             * @method undelegateEvents
             * @chainable
             */
            undelegateEvents: function() {
                this.$el.unbind('.delegateEvents' + this.id);
                return this;
            }
        }
    };

    var
        /**
         `app.navPage`或者`app.pageBack`开始前促发
         @event pagebeforechange
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String|Undefined} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.navPage` or `app.pageBack`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_PAGE_BEFORE_CHANGE = 'pagebeforechange',
        /**
         页面切换完成时促发，包括`app.navPage`和`app.pageBack`

             var app = new EasyTouch({...});
                 app.bind('pagechange', function(e, params){
                 var fromPage = this.getPage(params.from);
             }, app);

         @event pagechange
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String|Undefined} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.navPage` or `app.pageBack`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_PAGE_CHANGE = 'pagechange',
        /**
         `app.pageBack`开始前促发
         @event pagebeforeback
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.pageBack`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_PAGE_BEFORE_BACK = 'pagebeforeback',
        /**
         `app.pageBack`完成时促发
         @event pageback
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.pageBack`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_PAGE_BACK = 'pageback',
        /**
         `app.navPage`完成时促发
         @event pagenav
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.navPage`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_PAGE_NAV = 'pagenav',
        /**
         `app.navPage`开始前促发
         @event pagebeforenav
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.from page id of prev page
         @param {String|Undefined} params.to page id of next page
         @param {Object|Undefined} params.data the data when you call `app.navPage`
         @param {String|Undefined} params.anim the animation name
         **/
        EVN_APP_BEFORE_PAGE_NAV = 'pagebeforenav',
        /**
         异步获取页面前促发
         @event pagebeforeload
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.id page id of prev page
         @param {Object} params.data page data for the target page
         **/
        EVN_APP_BEFORE_PAGE_LOAD = 'pagebeforeload',
        /**
         异步获取页面完成后促发
         @event pageload
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.id page id of prev page
         @param {Object} params.data page data for the target page
         **/
        EVN_APP_PAGE_LOAD = 'pageload',
        /**
         异步获取页面失败时促发
         @event pageloadfailed
         @param {Object} e event object from custom-event
         @param {Object} params
         @param {String} params.id page id of prev page
         @param {Object} params.data page data for the target page
         **/
        EVN_APP_PAGE_LOAD_ERROR = 'pageloadfailed',
        /**
         * 退出应用时，子应用促发
         * @event exit
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the child app's id
         *      @param {Object} data data for the parent app
         */
        EVN_APP_EXIT = 'appexit',
        /**
         * 第二次`app.navApp`到子应用时，子应用促发
         * @event reset
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} data data for the target app
         */
        EVN_APP_RESET = 'appreset',
        /**
         * 从子应用回到宿主应用时，宿主应用促发
         * @event appback
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the child app's id
         *      @param {Object} data when the child app call `app.exit`
         */
        EVN_APP_BACK = 'appback',
        /**
         * `app.navApp`后促发
         * @event appnav
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} params.data the data for the target app
         */
        EVN_APP_NAV = 'appnav',
        /**
         * `app.navApp`前促发
         * @event appbeforenav
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} params.data the data for the target app
         */
        EVN_APP_BEFORE_NAV = 'appbeforenav',
        /**
         * 第一次加载子应用时促发
         * @event appbeforeload
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} params.data the data for the target app
         */
        EVN_APP_BEFORE_LOAD = 'appbeforeload',
        /**
         * 第一次加载子应用完成时促发
         * @event appload
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} params.data the data for the target app
         */
        EVN_APP_LOAD = 'appload',
        /**
         * 加载子应用失败时促发
         * @event apploadfailed
         * @param {Object} e event object from custom-event
         * @param {Object} params
         *      @param {String} params.id the target app's id
         *      @param {Object} params.data the data for the target app
         */
        EVN_APP_LOAD_ERROR = 'apploadfailed',
        TIME_WAIT_FOR_RENDER = 0,
        TIME_WAIT_FOR_ANIMATION = 100,
        CLASS_APP = 'easytouch',
        CLASS_PREFIX = 'et-',
        SESSION_HISTORY = 'easytouch:page_history',
        MARK_CHILD_APP = 'easytouch-childapp';

    var reverseAnimation = function(animation, regex){
        var _reverse = function(anim){
            var opposites={
                'Top' : 'Bottom',
                'Bottom' : 'Top',
                'Left' : 'Right',
                'Right' : 'Left',
                'In' : 'Out',
                'Out' : 'In'
            };
            return opposites[anim] || anim;
        };
        regex = regex || /Left|Right|Top|Bottom|In|Out/g;
        return animation.replace(regex, _reverse);
    };

    /**
     EasyTouch，为移动设备设计的UI框架。使用方法：用`$.EasyTouch.App.extend`方法扩展一个App类，然后初始化。`extend`的具体说明，请看`$.EasyTouch.App.extend`；参数`pages`的说明请看`$.EasyTouch.App.Page`：

         var App = $.EasyTouch.App.extend({
             id: xxx,
             container: xxx,
             pages: {
                ...
             },
             apps: {
                ...
             },
             events: {
                ...
             }
         });

         new App();

     @class $.EasyTouch.App
     @extends $.Base
     @constructor
     **/
    $.EasyTouch.App = $.Base.build('$.EasyTouch.App', {
        /**
         * [需要重写]应用id
         * @property id
         * @type String
         * @default 'easytouch'
         * @optional
         */
        id: 'easytouch',
        /**
         * [需要重写]容器
         * @property container
         * @type HTMLElement|Node|String
         * @default 'body'
         * @optional
         */
        container: 'body',
        /**
         * [需要重写]加载页面和应用时是否显示加载中提示
         * @property ifShowLoading
         * @type Boolean
         * @default true
         * @optional
         */
        ifShowLoading: true,
        /**
         * [需要重写]页面切换时的默认动画
         * @property defaultAnimation
         * @type String
         * @default undefined
         * @optional
         */
        defaultAnimation: undefined,
        /**
         * [需要重写]代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
         *
         *      {
         *          '#contariner header': {
         *              tap: 'nav
         *          },
         *          '#contariner': {
         *              tap: function(){},
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
         * [需要重写]Page原型
         * @property pages
         * @type Object
         * @required
         */
        pages: {},
        /**
         * [需要重写]子应用的配置
         *
         *      {
         *          'hongbao': 'http://cloudappfile.aliapp.com/prod/app_4/7184_b6b/hongbao/'
         *      }
         *
         * @property apps
         * @type Object
         * @optional
         */
        apps: {},
        /**
         * 容器（原生dom）
         * @property el
         * @type HTMLElement
         * @optional
         */
        el: undefined,
        /**
         * 容器（Zepto对象）
         * @property $el
         * @type Node
         * @optional
         */
        $el: undefined,
        /**
         * Page实例
         * @property _pages
         * @type Object
         * @private
         */
        _pages: {},
        /**
         * 子应用
         * @property _apps
         * @type Object
         * @private
         */
        _apps: {},
        /**
         * 页面跳转的历史记录
         * @property _history
         * @type Array
         * @private
         */
        _history: [],
        /**
         * 宿主应用
         * @property host
         * @type Object
         * @private
         */
        host: undefined,
        /**
         * 宿主应用是否处于可视状态
         * @property _active
         * @type Boolean
         * @private
         */
        _active: true,
        /**
         * 构造函数
         * @method initializer
         * @private
         * @param options 应用启动参数
         */
        initializer: function(options){
            //通过url上的标志判断是否时子应用
            if(window.location.href.indexOf(MARK_CHILD_APP) !== -1){
                this.host = {
                    window: window.parent
                };
                //通知宿主应用，应用加载成功
                this.host.window.postMessage({
                    id: this.id,
                    event: EVN_APP_LOAD
                }, '*');
                try{
                    options = JSON.parse(decodeURIComponent(window.location.hash.substring(MARK_CHILD_APP.length + 2)));
                    //清楚hash，防止刷新的时候不能回到上一次访问的页面
                    //window.location.hash = '';
                }catch(ex){}
            }

            console.log('[EasyTouch] initializer', options);

            var _this = this;
            this.history = this.history();
            this.$el = typeof this.container === 'string'?$(this.container):this.container;
            this.$el.addClass(CLASS_APP);
            this.el = this.$el[0];
            this.delegateEvents(this.events);

            //yunos event
            var postChildEvents = function(event){
                $.each(_this._apps, function(k, v){
                    v.window.postMessage({
                        id: k,
                        event: event
                    }, '*');
                });
            };
            $(document).bind('resume', function(e){
                postChildEvents(e.type);
                _this.resume();
            }).bind('pause', function(e){
                postChildEvents(e.type);
                _this.pause();
            }).bind('backbutton', function(e){
                postChildEvents(e.type);
                if(_this._active){
                    _this.pageBack();
                }
            }).bind('resetbutton', function(e){
                postChildEvents(e.type);
                _this.resetbutton();
            });

            //loading
            if(this.ifShowLoading){
                this.bind(EVN_APP_BEFORE_PAGE_LOAD, function(){
                    _this.showLoading();
                });
                this.bind(EVN_APP_PAGE_LOAD, function(){
                    _this.hideLoading();
                });
                this.bind(EVN_APP_PAGE_LOAD_ERROR, function(){
                    _this.hideLoading();
                });
                this.bind(EVN_APP_BEFORE_LOAD, function(){
                    _this.showLoading();
                });
                this.bind(EVN_APP_LOAD, function(){
                    _this.hideLoading();
                });
                this.bind(EVN_APP_LOAD_ERROR, function(){
                    _this.hideLoading();
                });
            }

            //load fail
            this.bind(EVN_APP_LOAD_ERROR, function(e, data){
                var app = this._apps[data.id];
                if(app){
                    app.$el.remove();
                    delete this._apps[data.id];
                }
            }, this);
            this.bind(EVN_APP_PAGE_LOAD_ERROR, function(e, data){
                delete this._pages[data.id];
            }, this);

            //child app message
            window.addEventListener('message', function(e){
                console.log('[EasyTouch] onmessage', e);

                var data = e.data,
                    event = data.event;
                if(event === EVN_APP_EXIT){
                    if(_this._apps[data.id]){
                        _this._apps[data.id].$el.hide();
                        _this._active = true;
                        _this.trigger(EVN_APP_BACK, data);
                    }
                }else if(event === EVN_APP_RESET){
                    _this.reset(data.data);
                    _this.trigger(EVN_APP_RESET, data);
                }else if(event === EVN_APP_LOAD){
                    if(_this._apps[data.id]){
                        _this._apps[data.id].loaded = true;
                    }
                }else if(['resume', 'pause', 'backbutton', 'resetbutton'].indexOf(event) !== -1){
                    $(document).trigger(event);
                }
            });


            this.bind(EVN_APP_PAGE_CHANGE, function(e, data){
                var params = {
                    id: data.to,
                    data: data.data || {}
                };
                window.location.hash = encodeURIComponent(JSON.stringify(params));
            });
            window.addEventListener('hashchange', function(){
                try{
                    var hash = JSON.parse(decodeURIComponent(window.location.hash.substring(1))),
                        PID = hash.id;
                    if(!PID){
                        return;
                    }
                    var pre = _this._history[_this.history.getIndex() - 1];
                    if(_this.getCurrentPID() === PID){
                        console.log('[EasyTouch] hashchange', PID + ' is current page');
                        return false;
                    }else if(!_this.pages[PID]){
                        console.log('[EasyTouch] hashchange', PID + ' is not exist');
                        return false;
                    }else if(pre && pre.id === PID){
                        console.log('[EasyTouch] hashchange', 'pageBack');
                        _this.pageBack(hash.data, hash.anim);
                    }else{
                        console.log('[EasyTouch] hashchange', 'navPage');
                        _this.navPage(PID, hash.data, hash.anim, true);
                    }
                }catch(ex){}
            });

            this.init(options);
        },
        /**
         * [需要重写]Init lifecycle method, invoked during construction. Fires the init event prior to setting up attributes and invoking initializers for the class hierarchy.
         * @method init
         * @param {Object} options
         */
        init: function(options){
            console.log('[EasyTouch] init', arguments);
        },
        /**
         * [需要重写]作为子应用第二次访问被访问时执行
         * @method reset
         * @param {Object} options
         */
        reset: function(options){
            console.log('[EasyTouch] reset', arguments);
        },
        /**
         * [需要重写]YunOS的resume事件监听，halo会在`document`上促发该事件
         * @method resume
         */
        resume: function(){
            console.log('[EasyTouch] resume', arguments);
        },
        /**
         * [需要重写]YunOS的pause事件监听，halo会在`document`上促发该事件
         * @method pause
         */
        pause: function(){
            console.log('[EasyTouch] pause', arguments);
        },
        /**
         * 按云键，默认退出应用，halo会在`document`上促发该事件
         * @method resetbutton
         * @chainable
         */
        resetbutton: function(){
            console.log('[EasyTouch] resetbutton', arguments);
            this.exit();
            return this;
        },
        /**
         * 退出应用，当子应用调用该方法时，可是携带参数，宿主应用会在`back`事件中获得这些参数
         * @method exit
         * @param {Object} data the data for the parent app
         * @chainable
         */
        exit: function(data){
            console.log('[EasyTouch] exit', arguments);

            if(this.host){
                var params = {
                    id: this.id,
                    data: data,
                    event: EVN_APP_EXIT
                };
                this.host.window.postMessage(params, '*');
                this.trigger(EVN_APP_EXIT, params);
            }else{
                navigator.app.exit();
            }

            return this;
        },
        /**
         * @method navApp
         * @param {String} id the target app's id
         * @param {Object} data data for the target app
         * @chainable
         */
        navApp: function(id, data){
            var _this = this,
                _data = $.extend({}, data);

            data = {
                id: id,
                data: data
            };

            this.trigger(EVN_APP_BEFORE_NAV, data);

            if(this._apps[id]){
                this._apps[id].window.postMessage({
                    id: id,
                    event: EVN_APP_RESET,
                    data: _data
                }, '*');
                this._apps[id].$el.show();
            }else{
                var url = this.apps[id];
                try{
                    url += '#' + MARK_CHILD_APP + '=' + encodeURIComponent(JSON.stringify(_data));
                }catch(ex){}
                this.trigger(EVN_APP_BEFORE_LOAD, data);
                var iframe = $('<iframe src="'+url+'" class="'+CLASS_PREFIX+'app"></iframe>').bind('load', function(e){
                    setTimeout(function(){
                        if(_this._apps[id].loaded){
                            _this.trigger(EVN_APP_LOAD, data);
                        }else{
                            _this.trigger(EVN_APP_LOAD_ERROR, data);
                        }
                    }, 500);
                }).bind('error', function(e){
                        _this.trigger(EVN_APP_LOAD_ERROR, data);
                    }).css({
                        height: window.screen.height,
                        width: window.screen.width,
                        display: 'block'
                    }).appendTo(this.$el);
                this._apps[id] = {
                    $el: iframe,
                    el: iframe[0],
                    window: iframe[0].contentWindow
                };
            }

            this._active = false;
            this.trigger(EVN_APP_NAV, data);

            return this;
        },
        /**
         通过ID获取某一个app

            app.getApp('hongbao');

         @method getApp
         @param {String} id app's id
         @return {Object} app: {HTMLElement} app.el the iframe of app; {Node} app.$el the iframe of app; {HTMLElement} app.window the contentWindow of iframe
         **/
        getApp: function(id){
            return this._apps[id];
        },
        /**
         页面跳转

             app.navPage('DetailPage', {
                 title: 'MacBook Air',
                 desc: '...'
             }, 'sliderRightIn', false);

         @method navPage
         @param {String} id page id
         @param {Object} data data for next page
         @param {String} anim animation name, contain:

         *   slideRightIn
         *   slideLeftIn
         *   slideTopIn
         *   slideBottomIn
         *   fadeIn
         *   dissolveIn
         *   popIn <sup>4.0+</sup>
         *   flipLeftIn <sup>4.0+</sup>
         *   flipRightIn <sup>4.0+</sup>
         *   swapLeftIn <sup>4.0+</sup>
         *   swapRightIn <sup>4.0+</sup>
         *   cubeLeftIn <sup>4.0+</sup>
         *   cubeRightIn <sup>4.0+</sup>
         *   flowLeftIn <sup>4.0+</sup>
         *   flowRightIn <sup>4.0+</sup>
         *   turnIn <sup>4.0+</sup>

         include the animation css in your less file like this:
         <pre class="code"><code>@import <span class="str">"easytouch/less/anim.less"</span>;
         <span class="com">
         //Notice: When the slideRightIn included, the slideLeftOut is also ready.
         //The same, when you include slideLeftOut, slideRightIn is ready too.
         //All the animation function has two options: "duration" and "function".</span>
         <span style="color:#30418C"><span style="color:#30418C">.easytouch-slide</span>(<span class="lit">.6</span>s, <span class="str">ease-in</span>);
         </code></pre>

         @param {Boolean} ifPushToHistory if push the page to history, default: `true`
         @chainable
         **/
        navPage: function(id, data, anim, ifPushToHistory){
            if(this.$el.hasClass('animating')){
                console.log('[EasyTouch] navPage', 'animating');
                return this;
            }
            if(!this.pages[id]){
                console.log('[EasyTouch] navPage', id + ' is not exist');
                return this;
            }
            if(this.getCurrentPID() === id && this.$el.find('.et-current').length){
                console.log('[EasyTouch] navPage', id + ' is current page');
                return this;
            }
            var status = 0,//正常
                index = this.history.getIndex();
            if(index < this._history.length - 1){
                var nextRecord = this._history[index+1];
                if(nextRecord.id === id){
                    data = data || nextRecord.data;
                    anim = anim || nextRecord.anim;
                    status = 2; //forward
                }else if(id === this.getCurrentPID()){
                    status = 3; //当前页
                }else{
                    status = 1; //分叉
                }
            }

            console.log(status);

            console.log('[EasyTouch] navPage', arguments);

            anim = anim || this.defaultAnimation;

            var _this = this,
                argus = [id, data, anim, ifPushToHistory],
                currentPage = this.getCurrentPage(),
                _data = $.extend({}, data),
                pushHistory = function(id, data, anim, ifPushToHistory){
                    if(status === 2){
                        _this.history.setCurrent(index + 1);
                    }else if(status === 1){
                        var tmp = [];
                        for(var i= 0,j=_this._history.length;i<j;i++){
                            var h = _this._history[i];
                            if(i <= index){
                                tmp.push(h);
                            }else{
                                break;
                            }
                        }
                        _this._history = tmp;
                        _this.history.push({
                            id: id,
                            data: data,
                            anim: anim
                        });
                    }else if(status === 3){
                        _this.history.update(index, {
                            data: data,
                            anim: anim
                        });
                    }else{
                        if(ifPushToHistory === false){
                            return;
                        }
                        _this.history.push({
                            id: id,
                            data: data,
                            anim: anim
                        });
                    }
                };
            if(currentPage && currentPage.id === id){
                currentPage.trigger(EVN_PAGE_RESET, _data);
                pushHistory.apply(_this, argus);
                return this;
            }

            var eventArgus = {
                    from: currentPage?currentPage.id:undefined,
                    to: id,
                    data: data,
                    anim: anim
                },
                trigger = function(fromPage, toPage){
                    pushHistory.apply(_this, argus);
                    fromPage && fromPage.trigger(EVN_PAGE_LEAVE);
                    toPage.trigger(EVN_PAGE_READY, data);
                    _this.trigger(EVN_APP_PAGE_NAV, eventArgus);
                    _this.trigger(EVN_APP_PAGE_CHANGE, eventArgus);
                };
            this.trigger(EVN_APP_BEFORE_PAGE_NAV, eventArgus);
            this.trigger(EVN_APP_PAGE_BEFORE_CHANGE, eventArgus);
            if(!this._pages[id]){
                _this._createPage(id, _data, function(page){
                    _this._transitionPages(currentPage, page, data, anim, trigger);
                });
            }else{
                this._pages[id].trigger(EVN_PAGE_RESET, _data);
                _this._transitionPages(currentPage, this._pages[id], data, anim, function(fromPage, toPage){
                    trigger.apply(_this, arguments);
                });
            }

            return this;
        },
        /**
         返回到上一个页面

             app.pageBack({
                id: xxx
             }, 'popIn');

         @method pageBack
         @param {Object} data data for next page
         @param {String} anim animation name, as same as `app.navPage`
         @chainable
         **/
        pageBack: function(data, anim){
            console.log('[EasyTouch] pageBack', arguments);
            if(this.$el.hasClass('animating')){
                console.log('[EasyTouch] pageBack', 'animating');
                return this;
            }
            if(this._history.length <= 1){
                this.exit();
                return this;
            }

            var _this = this,
                _data,
                currentPage = _this.getCurrentPage(),
                index = _this.history.getIndex(),
                preRecord = this._history[index - 1],
                lastRecord = this._history[index],
                id = preRecord.id,
                eventArgus,
                trigger = function(fromPage, toPage){
                    _this.history.setCurrent(index - 1);

                    fromPage.trigger(EVN_PAGE_LEAVE);
                    toPage.trigger(EVN_PAGE_READY, data);
                    _this.trigger(EVN_APP_PAGE_BACK, eventArgus);
                    _this.trigger(EVN_APP_PAGE_CHANGE, eventArgus);
                };

            //如果没有初始化过该页面，说明来至单页面刷新，获取缓存中的data
            data = (this._pages[id] ? data : preRecord.data) || {};
            anim = anim || lastRecord.anim;
            anim = anim?reverseAnimation(anim, /Left|Right|Top|Bottom/g):null;
            eventArgus = {
                from: lastRecord.id,
                to: preRecord.id,
                data: data,
                anim: anim
            };

            this.trigger(EVN_APP_PAGE_BEFORE_BACK, eventArgus);
            this.trigger(EVN_APP_PAGE_BEFORE_CHANGE, eventArgus);

            _data = $.extend({}, data);
            if(!this._pages[id]){
                this._createPage(id, _data, function(page){
                    _this._transitionPages(currentPage, page, data, anim, trigger);
                });
            }else{
                this._pages[id].trigger(EVN_PAGE_RESET, _data);
                this._transitionPages(currentPage, this._pages[id], data, anim, function(fromPage, toPage){
                    trigger.apply(_this, arguments);
                });
            }

            return this;
        },
        /**
         * 页面切换效果
         * @method _transitionPages
         * @param {Object} fromPage
         * @param {Object} toPage
         * @param {String} anim animation name
         * @param {Function} callback
         * @private
         * @chainable
         */
        _transitionPages: function(fromPage, toPage, data, anim, callback){
            var _this = this;

            // Collapse the keyboard
//            if (document.activeElement && document.activeElement.nodeName.toLowerCase() !== 'body') {
//                $(document.activeElement).blur();
//            } else {
//                $( ":focus" ).blur();
//            }

            var $toPage = toPage.$el;
            if(!fromPage){
                this.$el.find('.' + CLASS_PREFIX + 'page').removeClass('current'); //TODO: 但页面刷新时，需要隐藏页面上写死的Page
                $toPage.addClass('current');
                callback && callback(fromPage, toPage);
                return this;
            }
            var $fromPage = fromPage.$el;
            if(anim){
                anim = CLASS_PREFIX + anim;
                var reverseClass = reverseAnimation(anim);
                $toPage.bind('webkitAnimationEnd', function(){
                    $toPage.unbind('webkitAnimationEnd').removeClass(anim);
                    setTimeout(function(){
                        callback && callback(fromPage, toPage);
                        _this.$el.removeClass('animating');
                    }, TIME_WAIT_FOR_ANIMATION)
                });
                $fromPage.bind('webkitAnimationEnd', function(){
                    $fromPage.unbind('webkitAnimationEnd').removeClass(reverseClass+' current');
                });
                this.$el.addClass('animating');
                $fromPage.addClass(reverseClass);
                $toPage.addClass(anim + ' current');
            }else{
                $fromPage.removeClass('current');
                $toPage.addClass('current');
                callback && callback(fromPage, toPage);
            }

            return this;
        },
        /**
         * 初始化一个Page类
         * @method _createPage
         * @param {String} id page id
         * @param {Object} data data for next page
         * @param {Function} callback
         * @private
         * @chainable
         */
        _createPage: function(id, data, callback){
            if(typeof this.pages[id] !== 'function'){
                this.pages[id] = $.EasyTouch.Page.extend(this.pages[id]);
            }
            this._pages[id] = new this.pages[id]({
                id: id,
                data: data,
                app: this
            });

            if(!callback){
                return this;
            }
            if(this._pages[id]._inited){
                callback(this._pages[id])
            }else{
                this._pages[id].bind(EVN_PAGE_INIT, function(){
                    callback(this);
                });
            }

            return this;
        },
        /**
         向App添加一个页面

             app.addPage('DetailPage', {
                html: '#DetailPage'
             });

         @method addPage
         @param id page id
         @param {String|Object} options 参数与调用`$.EasyTouch.Page.extend`时一致，内部会调用该方法扩展一个Page类
         @chainable
         **/
        addPage: function(id, options){
            this.pages[id] = options;
            return this;
        },
        /**
         从App移除一个页面，该方法只会从app的实例中删除对该Page的引用

            app.removePage('DetailPage');

         @method removePage
         @param id page id
         @chainable
         **/
        removePage: function(id){
            delete this.pages[id];
            delete this._pages[id];
            this.history.remove(id);
            return this;
        },
        /**
         销毁一个页面，该方法不但会从app的实例中删除对该Page的引用，也会调用该page的`destroy`方法，完全删除页面

            app.destroyPage('DetailPage');

         @method destroyPage
         @param id page id
         @chainable
         **/
        destroyPage: function(id){
            this._pages[id] && this._pages[id].destroy();
            return this;
        },
        /**
         通过页面ID获取某一个页面的引用

            app.getPage('DetailPage');

         @method getPage
         @param {String} id page id
         @return {Object} the instance of page
         **/
        getPage: function(id){
            return this._pages[id];
        },
        /**
         * 获取当前页面的引用
         * @method getCurrentPage
         * @return {Object} the instance of page
         */
        getCurrentPage: function(){
            return this._history.length?this._pages[this._history[this.history.getIndex()].id]:null;
        },
        /**
         * 获取当前页面的ID
         * @method getCurrentPID
         * @return {String} the page id
         */
        getCurrentPID: function(){
            return (this._pages && this._history.length)?this._history[this.history.getIndex()].id:null;
        },
        history: function(){
            var _this = this,
                useHistory,
                storageKey = _this.id + ':' + SESSION_HISTORY;
            if(sessionStorage.getItem(storageKey)){
                this._history = JSON.parse(sessionStorage.getItem(storageKey));
            }
            return {
                /**
                 启用单页面刷新功能, 并开始记录页面跳转, 如果存在历史记录, 则跳转至最后一条历史记录, 反之跳转至options中指定的页面

                     app.history.start({
                         id: 'IndexPage',
                         data: {
                            name: 'YouXiao'
                         }
                     })

                 @method history.start
                 @param {Object} options data to call navPage when the history is empty
                 @param {String} options.id page id
                 @param {Object} options.data data for the default page
                 **/
                start: function(options){
                    useHistory = true;
                    if(_this._history.length){
                        var record = _this._history[_this.history.getIndex()];
                        _this.navPage(record.id, record.data);
                    }else{
                        _this.navPage(options.id, options.data);
                    }
                },
                getIndex: function(){
                    for(var i= 0,j=_this._history.length;i<j;i++){
                        if(_this._history[i].on){
                            return i;
                        }
                    }
                },
                setCurrent: function(index){
                    _this._history = _this._history.map(function(item, i){
                        if(index === i){
                            item.on = true;
                        }else{
                            if(item.on){
                                delete item.on;
                            }
                        }
                        return item;
                    });
                    _this.history.save();
                },
                update: function(index, params){
                    $.extend(true, _this._history[index], params);
                },
                /**
                 * 从尾部删除一条历史记录,并写入`sessionStorage`
                 * @method history.pop
                 * @private
                 */
                pop: function(){
                    _this._history.pop();
                    _this.history.save();
                },
                /**
                 * 从历史记录中移除某一id的数据,并写入`sessionStorage`
                 * @method history.remove
                 * @private
                 */
                remove: function(id){
                    _this._history = _this._history.filter(function(item){
                        return item.id !== id;
                    });
                    _this.history.save();
                },
                /**
                 * 增加一条历史记录,并写入`sessionStorage`
                 * @method history.add
                 * @param {Object} record
                 *      @param {String} record.id page id
                 *      @param {Object} record.data data for navPage
                 *      @param {String} record.anim the animation name
                 * @private
                 */
                push: function(record){
                    var lastPID = _this.getCurrentPID(),
                        firstPID = _this._history.length && _this._history[0].id,
                        index = _this.history.getIndex();
                    if(lastPID){
                        delete _this._history[index].on;
                    }
                    record.on = true;
                    if(record.id !== lastPID && record.id !== firstPID){
                        _this._history.push(record);
                    }else if(record.id === lastPID){
                        //相等时，仅更新data参数
                        _this._history[index].data = record.data;
                        _this._history[index].on = true;
                    }else if(record.id === firstPID){
                        _this._history = [record];
                    }
                    _this.history.save();
                },
                /**
                 * 将内存中的历史记录写入`sessionStorage`
                 * @method history.save
                 * @private
                 */
                save: function(){
                    if(!useHistory){
                        return;
                    }
                    sessionStorage.setItem(storageKey, JSON.stringify(_this._history));
                }
            }
        }
        /**
         * 在APP容器中显示加载中提示
         * @method showLoading
         * @param {Object} options
         *      @param {String} options.msg 需要显示的文案
         *      @param {Boolean} options.modal 加载中提示是否覆盖住应用禁止操作
         * @chainable
         */
        /**
         * 隐藏APP容器中的加载中提示
         * @method hideLoading
         * @chainable
         */
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
    },{
    },{
        /**
         通过该方法来继承并扩展一个`$.EasyTouch.App`

             var App = $.EasyTouch.App.extend({
                 id: 'market',
                 container: '#app',
                 ifShowLoading: false,
                 defaultAnimation: 'slideRightIn',
                 debug: true,
                 pages: {},
                 apps: {
                    'hongbao': 'http://cloudappfile.aliapp.com/prod/app_4/7184_b6b/hongbao/'
                 },
                 events: {
                     'tap header': 'tapHeader',
                     'tap .back': this.app.pageBack
                 },
                 //this function will run when creating instance
                 init: function(data){},
                 //for YunOS resume event
                 resume: function(){},
                 //for YunOS suspend event
                 pause: function(){}
             });
             new App();

         @method extend
         @param {Object} property 需要扩展的属性列表
         @param {String} property.id 应用ID，用于EasyTouch内部识别
         @param {Node|HTMLElement|String} property.container 应用容器，默认为`body`
         @param {Boolean} property.ifShowLoading 页面加载过程是否显示加载中的提示，默认为`true`
         @param {String} property.defaultAnimation 默认的页面切换效果，默认为`undefined`
         @param {Boolean} property.debug debug模式开关，默认为`false`
         @param {Object} property.pages 页面配置：
         如果是一个Object，EasyTouch会调用`$.EasyTouch.Page.extend`，将这个Object作为prototype属性扩展出一个Page，具体请看`$.EasyTouch.Page.extend`；
         如果是一个`$.EasyTouch.Page.extend`产生的Class，则将直接使用该类作为一个Page；
         @param {Object} property.apps 子应用配置：key为应用的id，value为应用的访问地址，子应用将作为一个iframe的形式存在
         @return {Function} the new Class extended from `$.EasyTouch.App`
         @static
         **/
        extend: function(property){
            property.super = $.EasyTouch.App.prototype;
            var child = $.Base.extend('$.EasyTouch.App', this, property);
            child.extend = this.extend;
            return child;
        }
    });
    $.extend($.EasyTouch.App.prototype, $.EasyTouch.DelegateEvents);
    $.extend($.EasyTouch.App.prototype, $.EasyTouch.Loading);

    /**
     * EasyTouch的子模块Page
     *
     * @module EasyTouch
     * @submodule EasyTouch-Page
     */

    /**
     页面类，该类不需要应用自己实例化，EasyTouch会在`app.navPage`时判断是否实例化了该页面，如果没有会自动实例化，你需要做的就是用`$.EasyTouch.Page.extend`方法扩展一个Page类，然后配置到APP中：

         var Page1 = $.EasyTouch.Page.extend({
             html: '#xxx .xxx',
             //tpl: '',
             events: {
                ...
             },
             init: function(){},
             reset: function(){}
                ...
         });
         var App = $.EasyTouch.extend({
             pages: {
                'Page1': Page1
             }
             ...
         });
         new App();

     @class $.EasyTouch.Page
     @extends $.Base
     @param {Object} options
     @param {String} options.id page id
     @param {Object} options.data property add to `$.EasyTouch.Page`
     @param {Object} options.app the instance of `$.EasyTouch`, the page is in which app
     @constructor
     **/
    var
    /**
     页面第一次被访问前会促发该事件，`page.init`执行前
     @event pagebeforeinit
     @param {Object} e event object from custom-event
     @param {Object} data the data from `app.navPage`
     @private
     **/
    EVN_PAGE_BEFORE_INIT = 'pagebeforeinit',
    /**
     页面第一次被访问时会促发该事件，`page.init`执行后
     @event pageinit
     @param {Object} e event object from custom-event
     @param {Object} data the data from `app.navPage`
     @private
     **/
    EVN_PAGE_INIT = 'pageinit',
    /**
     除了第一次初始化时,页面每一次被访问时都会促发该事件
     @event pagereset
     @param {Object} e event object from custom-event
     @param {Object} data the data from `app.navPage`
     **/
    EVN_PAGE_RESET = 'pagereset',
    /**
     每一次离开页面后促发该事件
     @event pageleave
     **/
    EVN_PAGE_LEAVE = 'pageleave',
    /**
     页面每一次页面完全切换完成(初始化完成,动画完成)都会执行该方法
     @event pageready
     @param {Object} e event object from custom-event
     @param {Object} data the data from `app.navPage` or `app.pageBack`
     **/
    EVN_PAGE_READY = 'pageready',

    REGEX_HTML_ADRESS = /^[\S]+\.html$/i,
    REGEX_SELECTOR = /^[a-zA-Z0-9\.#>\[\]'"=\s~\*\+:\(\)\-\$\^]+$/i;

    $.EasyTouch.Page = $.Base.build('$.EasyTouch.Page', {
        /**
         * [需要重写]`html`和`tpl`属性二选一，`html`将一段HTML作为一个页面，它可以来至：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
         * @property html
         * @type HTMLElement|Node|String
         * @optional
         */
        html: undefined,
        /**
         * [需要重写]将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的`innerHTML`作为模板，可以在`page.render`方法中使用任意模板引擎渲染改模板
         * @property tpl
         * @type HTMLElement|Node|String
         * @optional
         */
        tpl: undefined,
        /**
         * Page的id，用于`app.navPage`等操作时的索引
         * @property id
         * @type String
         */
        id: undefined,
        /**
         * [需要重写]代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
         *
         *      {
         *          '#contariner header': {
         *              tap: 'nav
         *          },
         *          '#contariner': {
         *              tap: function(){},
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
         * EasyTouch实例，该page所属app的引用
         * @property app
         * @type Object
         */
        app: undefined,
        /**
         * Page的dom容器
         * @property el
         * @type HTMLElement
         */
        el: undefined,
        /**
         * Page的$dom容器
         * @property $el
         * @type Node
         */
        $el: undefined,
        /**
         * 标识该page是否已经初始化完成
         * @property _inited
         * @type Boolean
         * @default false
         * @private
         */
        _inited: false,
        /**
         * 对`$.EasyTouch.Page.prototype`的引用
         * @property super
         * @type Object
         */

        initializer: function(options){
            console.log('[EasyTouch.Page] '+options.id+' initializer', arguments);

            this.app = options.app;
            var _this = this,
                data = options.data,
                eventParams = {
                    id: options.id,
                    data: $.extend({}, data)
                },
                init = function(el){
                    if(!el.attr('id')){
                        el.attr('id', options.id);
                    }
                    el.addClass(CLASS_PREFIX + 'page');
                    _this.app.$el.append(el);
                    _this.id = options.id;
                    _this.$el = el;
                    _this.el = _this.$el[0];
                    setTimeout(function(){
                        _this.delegateEvents(_this.events);
                        _this.trigger(EVN_PAGE_BEFORE_INIT, $.extend({}, data));
                        _this.init($.extend({}, data));
                        _this._inited = true;
                        _this.trigger(EVN_PAGE_INIT, $.extend({}, data));
                    }, TIME_WAIT_FOR_RENDER);
                };

            this.bind(EVN_PAGE_RESET, function(e, data){
                _this.reset(data);
            });
            this.bind(EVN_PAGE_LEAVE, function(e){
                _this.leave();
            });
            this.bind(EVN_PAGE_READY, function(e, data){
                _this.ready(data);
            });

            if(this.html){
                //xx.html
                if(REGEX_HTML_ADRESS.test(this.html)){
                    this.app.trigger(EVN_APP_BEFORE_PAGE_LOAD, eventParams);
                    $.ajax({
                        url: this.html,
                        success: function(response){
                            _this.app.trigger(EVN_APP_PAGE_LOAD, eventParams);
                            init($(response));
                        },
                        error: function(){
                            _this.app.trigger(EVN_APP_PAGE_LOAD_ERROR, eventParams);
                        }
                    });
                    //div / <div>xxx</div> / document.getElementsByTagName('div')[0]
                }else if(typeof this.html === 'string' || this.html.tagName){
                    init($(this.html));
                    //$('div')
                }else{
                    init(this.html);
                }
            }else if(this.tpl){
                //xxx.html
                if(REGEX_HTML_ADRESS.test(this.tpl)){
                    this.app.trigger(EVN_APP_BEFORE_PAGE_LOAD, eventParams);
                    $.ajax({
                        url: this.tpl,
                        success: function(response){
                            _this.app.trigger(EVN_APP_PAGE_LOAD, eventParams);
                            response = _this.render(response, data);
                            init($(response));
                        },
                        error: function(){
                            _this.app.trigger(EVN_APP_PAGE_LOAD_ERROR, eventParams);
                        }
                    });
                //div / document.getElementsByTagName('div')[0]
                }else if(REGEX_SELECTOR.test(this.tpl) || this.tpl.tagName){
                    init($(_this.render($(this.tpl).html(), data)));
                //$('div') zepto is $.zepto.Z / jquery is $
                }else if(this.tpl instanceof $ || this.tpl instanceof $.zepto.Z){
                    init($(_this.render(this.tpl.html(), data)));
                //<div>{{content}}</div>
                }else{
                    init($(_this.render(this.tpl, data)));
                }
            }else{
                console.error('html or tpl is require');
            }
        },
        /**
         * 当页面作为一个模板被加入App前,可以通过该方法渲染模板,默认原样返回
         * @method render
         * @param {String} template the html before render
         * @param {Object} data the data from `app.navPage`
         * @return {String} the html after render
         */
        render: function(template, data){
            console.log('[EasyTouch.Page] render');
            return template;
        },
        /**
         * 页面第一次被访问时会执行该方法
         * @method init
         * @param {Object} data the data from `app.navPage`
         */
        init: function(data){
            console.log('[EasyTouch.Page] '+this.id+' init', arguments);
        },
        /**
         * 除了第一次初始化时,页面每一次被访问时都会执行该方法,
         * 初始化时如果需要执行reset方法,请自行在init方法中调用
         * @method reset
         * @param {Object} data the data from `app.navPage` or `app.pageBack`
         */
        reset: function(data){
            console.log('[EasyTouch.Page] '+this.id+' reset', arguments);
        },
        /**
         * 页面每一次页面完全切换完成都会执行该方法
         * @method ready
         * @param {Object} data the data from `app.navPage` or `app.pageBack`
         */
        ready: function(data){
            console.log('[EasyTouch.Page] '+this.id+' ready', arguments);
        },
        /**
         * 每一次离开页面后执行该方法
         * @method leave
         */
        leave: function(){
            console.log('[EasyTouch.Page] '+this.id+' leave');
        },
        /**
         * 销毁该页面
         * @method destroy
         */
        destroy: function(){
            this.undelegateEvents();
            this.app.removePage(this.id);
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
        /**
         * 隐藏当前页面中的加载中提示
         * @method hideLoading
         * @chainable
         */
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
    },{
        /**
         * Page的id，用于`app.navPage`等操作时的索引
         * @attribute id
         * @type String
         */
        id: {},
        /**
         * EasyTouch实例，该page所属app的引用
         * @attribute app
         * @type Object
         */
        app: {},
        /**
         * 传递给page的参数
         * @attribute data
         * @type Object
         */
        data: {}
    },{
        /**
         通过该方法来继承并扩展一个`$.EasyTouch.Page`：

             var Page1 = $.EasyTouch.Page.extend({
                 //set html or tpl property, examples in $.EasyTouch example
                 html: '#Page1',
                 //html: document.getElementById('#Page1'),
                 //html: $('#Page1'),
                 //html: 'pages/Page1.html',

                 //tpl: '#Page1',
                 //tpl: document.getElementById('#Page1'),
                 //tpl: $('#Page1'),
                 //tpl: 'pages/Page1.html',

                 events: {
                     'header': {
                        tap: 'tapHeader',
                     }
                     '.back': {
                        tap: this.app.pageBack
                     }
                 },
                 render: function(template, data){
                     return Mustache.to_html(template, data);
                 },
                 init: function(){

                 },
                 reset: function(){

                 },
                 ready： function(){

                 },
                 leave： function(){

                 },
                 tapHeader: function(e, sender){

                 }
             });

         @method extend
         @param {Object} property property or function add to `$.EasyTouch.Page`
         @param {HTMLElement|Node|String} property.html `html`和`tpl`属性二选一，`html`将一个节点作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
         @param {HTMLElement|Node|String} property.tpl 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的`innerHTML`作为模板，可以在`page.render`方法中使用任意模板引擎渲染改模板
         @return {Function} the new Class extended from `$.EasyTouch.Page`
         @static
         **/
        extend: function(property){
            property.super = $.EasyTouch.Page.prototype;
            var child = $.Base.extend('$.EasyTouch.Page', this, property);
            child.extend = this.extend;
            return child;
        }
    });
    $.extend($.EasyTouch.Page.prototype, $.EasyTouch.DelegateEvents);
    $.extend($.EasyTouch.Page.prototype, $.EasyTouch.Loading);

    return $;
});