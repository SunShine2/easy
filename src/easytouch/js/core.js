/**
 * EasyTouch
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module EasyTouch
 * @uses EasyTouch-Page
 * @review
 *  1. 建立一个Logger机制
 *  2. 监听backbutton事件，如果是在子应用可以回到父应用
 *  
 */
;(function(){
var
    /**
    `navPage`或者`pageBack`开始前促发
    @event pagebeforechange
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `navPage` or `pageBack`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_CHANGE = 'pagebeforechange',
    /**
    页面切换完成时促发，包括`navPage`和`pageBack`

        var app = new EasyTouch({...});
        app.bind('pagechange', function(e, params){
            var fromPage = this.getPage(params.from);
        }, app);

    @event pagechange
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `navPage` or `pageBack`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_CHANGE = 'pagechange',
    /**
    `pageBack`开始前促发
    @event beforepageback
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `pageBack`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_BACK = 'beforepageback',
    /**
    `pageBack`完成时促发
    @event pageback
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `pageBack`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_BACK = 'pageback',
    /**
    `navPage`完成时促发
    @event pagenav
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `navPage`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_NAV = 'pagenav',
    /**
    `navPage`开始前促发
    @event beforepagenav
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call `navPage`
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_NAV = 'beforepagenav',
    /**
    异步获取页面前促发
    @event beforepageload
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.id page id of prev page
        @param {Object} params.params page params for the target page
    **/
    EVN_APP_BEFORE_PAGE_LOAD = 'beforepageload',
    /**
    异步获取页面完成后促发
    @event pageload
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.id page id of prev page
        @param {Object} params.params page params for the target page
    **/
    EVN_APP_PAGE_LOAD = 'pageload',
    /**
    异步获取页面失败时促发
    @event pageloadfailed
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.id page id of prev page
        @param {Object} params.params page params for the target page
    **/
    EVN_APP_PAGE_LOAD_ERROR = 'pageloadfailed',
    /**
     * 退出应用时促发
     * @event exit
     * @private
     */
    EVN_APP_EXIT = 'exit',
    /**
     * 用`navApp`第二次进入应用时促发
     * @event reset
     * @private
     */
    EVN_APP_RESET = 'reset',
    /**
     * `navApp`后促发
     * @event appnav
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_NAV = 'appnav',
    /**
     * `navApp`前促发
     * @event beforeappnav
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_BEFORE_NAV = 'beforeappnav',
    /**
     * 第一次加载子应用时促发
     * @event beforeappload
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_BEFORE_LOAD = 'beforeappload',
    /**
     * 第一次加载子应用完成时促发
     * @event appload
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_LOAD = 'appload',
    /**
     * 加载子应用失败时促发
     * @event apploadfailed
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_LOAD_ERROR = 'apploadfailed',
    TIME_WAIT_FOR_RENDER = 0,
    CLASS_APP = 'easytouch',
    CLASS_PREFIX = 'et-',
    SESSION_HISTORY = 'easytouch:page_history',
    MARK_CHILD_APP = 'easytouch-childapp',
    REGEX_EVENT_SPLITTER = /^(\S+)\s*(.*)$/,
    REGEX_HTML_ADRESS = /^[\S]+\.html$/i,
    REGEX_SELECTOR = /^[a-zA-Z0-9\.#>\[\]'"=\s~\*\+:\(\)\-\$\^]+$/i;

var reverseAnimation = function(animation, regex){
    var _reverse = function(anim){
        var opposites={
            'Up' : 'Down',
            'Down' : 'Up',
            'Left' : 'Right',
            'Right' : 'Left',
            'In' : 'Out',
            'Out' : 'In'
        };
        return opposites[anim] || anim;
    };
    regex = regex || /Left|Right|Up|Down|In|Out/g;
    return animation.replace(regex, _reverse);
};

var DelegateEvents = function(){};
DelegateEvents.prototype.delegateEvents = function(events){
    if (!events){
        return;
    }
    var _this = this;
    this.undelegateEvents();
    $.each(events, function(key, method){
        if ($.type(method) !== 'function'){
            method = _this[method];
        }
        var match = key.match(REGEX_EVENT_SPLITTER);
        var eventName = match[1], selector = match[2];
        var proxyfn = function(e){
            method.apply(_this, [e, this]);
        };
        eventName += '.delegateEvents' + _this.id;
        if (selector === '') {
            _this.$el.bind(eventName, proxyfn);
        } else {
            _this.$el.delegate(selector, eventName, proxyfn);
        }
    });
};
DelegateEvents.prototype.undelegateEvents = function() {
    this.$el.unbind('.delegateEvents' + this.id);
};

/**
EasyTouch，为移动设备设计的UI框架。使用方法：用`$.EasyTouch.extend`方法扩展一个App类，然后初始化。`extend`的具体说明，请看`$.EasyTouch.extend`；参数`pages`的说明请看`$.EasyTouch.Page`：

    var App = $.EasyTouch.extend({
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

@class $.EasyTouch
@extends $.Base
@constructor
**/
$.EasyTouch = $.Base.build('$.EasyTouch', {
    /**
     * 应用id
     * @property id
     * @type String
     * @default 'easytouch'
     * @optional
     */
    id: 'easytouch',
    /**
     * 容器
     * @property container
     * @type HTMLElement|Node|String
     * @default 'body'
     * @optional
     */
    container: 'body',
    /**
     * 加载页面和应用时是否显示加载中提示
     * @property ifShowLoading
     * @type Boolean
     * @default true
     * @optional
     */
    ifShowLoading: true,
    /**
     * 页面切换时的默认动画
     * @property defaultAnimation
     * @type String
     * @default undefined
     * @optional
     */
    defaultAnimation: undefined,
    /**
     * debug模式开关
     * @property debug
     * @type Boolean
     * @default false
     * @optional
     */
    debug: false,
    /**
     * 代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
     *
     *      {
     *          'tap #contariner header': 'nav',
     *          'tap #contariner': function(){}
     *      }
     *
     * @property events
     * @type Object
     * @optional
     */
    events: {},
    /**
     * Page原型
     * @property pages
     * @type Object
     * @required
     */
    pages: {},
    /**
     * 子应用的配置
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
    log: function(){
        if(this.debug){
            Function.apply.apply(console.log, [console, arguments]);
        }
    },
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
            }catch(ex){}
        }

        this.log('[EasyTouch] initializer', options);

        var _this = this;
        this.history = this.history();
        this.$el = typeof this.container === 'string'?$(this.container):this.container;
        this.$el.addClass(CLASS_APP);
        this.el = this.$el[0];
        this.delegateEvents(this.events);

        //yunos event
        $(document).bind('resume', function(e){
            _this.resume();
        }).bind('pause', function(e){
            _this.pause();
        }).bind('backbutton', function(e){
            if(_this._active){
                _this.pageBack();
            }
        }).bind('resetbutton', function(e){
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
            _this.log('[EasyTouch] onmessage', e);

            var data = e.data;
            if(data.event === EVN_APP_EXIT){
                if(_this._apps[data.id]){
                    _this._apps[data.id].$el.hide();
                    _this._active = true;
                    delete data.event;
                    _this.back(data);
                }
            }else if(data.event === EVN_APP_RESET){
                _this.reset(data.params);
            }else if(data.event === EVN_APP_LOAD){
                if(_this._apps[data.id]){
                    _this._apps[data.id].loaded = true;
                }
            }
        });

        this.init(options);
    },
    /**
     * Init lifecycle method, invoked during construction. Fires the init event prior to setting up attributes and invoking initializers for the class hierarchy.
     * @method init
     * @param {Object} options
     */
    init: function(options){
        this.log('[EasyTouch] init', arguments);
    },
    /**
     * YunOS的resume事件监听
     * @method resume
     */
    resume: function(){
        this.log('[EasyTouch] resume', arguments);
    },
    /**
     * YunOS的pause事件监听
     * @method pause
     */
    pause: function(){
        this.log('[EasyTouch] pause', arguments);
    },
    /**
     * ［子应用］第二次`navApp`到子应用时，调用子应用的reset方法
     * @method reset
     * @param {Object} params params for the target app
     */
    reset: function(params){
        this.log('[EasyTouch] reset', arguments);
    },
    /**
     * ［宿主应用］从子应用回到宿主应用时调用宿主应用的back方法
     * @method back
     * @param {Object} params when the child app call `exit`
     */
    back: function(params){
        this.log('[EasyTouch] back', arguments);
    },
    /**
     * 退出应用，当子应用调用该方法时，可是携带参数，宿主应用会在back方法中获得这些参数
     * @method exit
     * @param {Object} params the params for the parent app, the parent app can get the params from `back`
     */
    exit: function(params){
        this.log('[EasyTouch] exit', arguments);

        if(this.host){
            this.host.window.postMessage({
                event: EVN_APP_EXIT,
                id: this.id,
                params: params
            }, '*');
        }else{
            this.resetbutton();
        }
    },
    /**
     * 按云键，默认退出应用
     * @method resetbutton
     */
    resetbutton: function(){
        this.log('[EasyTouch] resetbutton', arguments);
        //TODO退出云应用
    },
    /**
     * @method navApp
     * @param {String} id the target app's id
     * @param {Object} params params for the target app
     */
    navApp: function(id, params){
        var _this = this,
            _params = $.extend({}, params),
            data = {
                id: id,
                params: params
            };

        this.trigger(EVN_APP_BEFORE_NAV, data);

        if(this._apps[id]){
            this._apps[id].window.postMessage({
                id: id,
                event: EVN_APP_RESET,
                params: _params
            }, '*');
            this._apps[id].$el.show();
        }else{
            var url = this.apps[id];
            try{
                url += '#' + MARK_CHILD_APP + '=' + encodeURIComponent(JSON.stringify(_params));
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
    },
    /**
     通过ID获取某一个app

        app.getApp('hongbao');

     @method getApp
     @param {String} id app's id
     @return {Object} `app`: {HTMLElement} app.el the iframe of app; {Node} app.$el the iframe of app; {HTMLElement} app.window the contentWindow of iframe
     **/
    getApp: function(id){
        return this._apps[id];
    },
    /**
    页面跳转

        app.navPage('DetailPage', {
            title: 'MacBook Air',
            desc: '...'
        }, 'sliderRightIn', -1);

    @method navPage
    @param {String} id page id
    @param {Object} params params for next page
    @param {String} anim animation name, contain:

    *   slideRightIn
    *   slideLeftIn
    *   slideUpIn
    *   slideDownIn
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
    //All the animation function has two params: "duration" and "function".</span>
    <span style="color:#30418C">.easytouch</span> > <span style="color:#30418C">.anim-slideRightIn</span>(<span class="lit">.6</span>s, <span class="str">ease-in</span>);
</code></pre>

    @param {Boolean} ifPushToHistory if push rhe page to history
    **/
    navPage: function(id, params, anim, ifPushToHistory){
        this.log('[EasyTouch] navPage', arguments);
        anim = anim || this.defaultAnimation;

        var _this = this,
            argus = [id, params, anim, ifPushToHistory !== false],
            currentPage = this.getCurrentPage(),
            _params = $.extend({}, params),
            pushHistory = function(id, params, anim, ifPushToHistory){
                if(!ifPushToHistory){
                    return;
                }
                _this.history.push({
                    id: id,
                    params: params,
                    anim: anim
                });
            };
        if(currentPage && currentPage.id === id){
            pushHistory.apply(_this, argus);
            currentPage.trigger(EVN_PAGE_RESET, _params);
            return;
        }

        var eventArgus = {
                from: currentPage?currentPage.id:undefined,
                to: id,
                params: params,
                anim: anim
            },
            trigger = function(){
                pushHistory.apply(_this, argus);
                _this.trigger(EVN_APP_PAGE_NAV, [eventArgus]);
                _this.trigger(EVN_APP_PAGE_CHANGE, [eventArgus]);
            };
        this.trigger(EVN_APP_BEFORE_PAGE_NAV, [eventArgus]);
        this.trigger(EVN_APP_BEFORE_PAGE_CHANGE, [eventArgus]);
        if(!this._pages[id]){
            _this._createPage(id, _params, function(){
                _this._navPage(currentPage, _this._pages[id], params, anim, trigger);
            });
        }else{
            this._pages[id].trigger(EVN_PAGE_RESET, _params);
            _this._navPage(currentPage, this._pages[id], params, anim, trigger);
        }
    },
    /**
    返回到上一个页面

        app.pageBack({
            id: xxx
        }, 'popIn');

    @method pageBack
    @param {Object} params params for next page
    @param {String} anim animation name, as same as `navPage`
    **/
    pageBack: function(params, anim){
        this.log('[EasyTouch] pageBack', arguments);

        if(this._history.length <= 1){
            this.exit();
            return;
        }

        var _this = this,
            _params,
            currentPage = _this.getCurrentPage(),
            preRecord = this._history[this._history.length - 2],
            lastRecord = this._history[this._history.length - 1],
            id = preRecord.id,
            eventArgus,
            trigger = function(){
                _this.history.pop();
                _this.trigger(EVN_APP_PAGE_BACK, [eventArgus]);
                _this.trigger(EVN_APP_PAGE_CHANGE, [eventArgus]);
            };

        //如果没有初始化过该页面，说明来至单页面刷新，获取缓存中的params
        params = (this._pages[id] ? params : preRecord.params) || {};
        anim = anim || lastRecord.anim;
        anim = anim?reverseAnimation(anim, /Left|Right|Up|Down/g):null;
        eventArgus = {
            from: lastRecord.id,
            to: preRecord.id,
            params: params,
            anim: anim
        };

        this.trigger(EVN_APP_BEFORE_PAGE_BACK, [eventArgus]);
        this.trigger(EVN_APP_BEFORE_PAGE_CHANGE, [eventArgus]);

        _params = $.extend({}, params);
        if(!this._pages[id]){
            this._createPage(id, _params, function(){
                _this._navPage(currentPage, _this._pages[id], params, anim, trigger);
            });
        }else{
            this._pages[id].trigger(EVN_PAGE_RESET, _params);
            this._navPage(currentPage, this._pages[id], params, anim, trigger);
        }
    },
    /**
     * 页面切换效果
     * @method _navPage
     * @param {Object} fromPage
     * @param {Object} toPage
     * @param {String} anim animation name
     * @param {Function} callback
     * @private
     */
    _navPage: function(fromPage, toPage, params, anim, callback){
        // Collapse the keyboard
        $(':focus').trigger('blur');

        var $toPage = toPage.$el;
        if(!fromPage){
            this.$el.find('.' + CLASS_PREFIX + 'page').hide(); //TODO: 但页面刷新时，需要隐藏页面上写死的Page
            $toPage.show();
            toPage.trigger(EVN_PAGE_READY, params);
            callback && callback();
            return;
        }
        var $fromPage = fromPage.$el;
        if(anim){
            anim = CLASS_PREFIX + anim;
            var reverseClass = reverseAnimation(anim);
            $fromPage.bind('webkitAnimationEnd', function(){
                $fromPage.hide().removeClass(reverseClass).unbind('webkitAnimationEnd');
                fromPage.trigger(EVN_PAGE_LEAVE);
            });
            $toPage.bind('webkitAnimationEnd', function(){
                $toPage.removeClass(anim).unbind('webkitAnimationEnd');
                toPage.trigger(EVN_PAGE_READY, params);
                callback && callback();
            });
            $fromPage.addClass(reverseClass);
            $toPage.show().addClass(anim);
        }else{
            $fromPage.hide();
            $toPage.show();
            fromPage.trigger(EVN_PAGE_LEAVE);
            toPage.trigger(EVN_PAGE_READY, params);
            callback && callback();
        }
    },
    /**
     * 初始化一个Page类
     * @method _createPage
     * @param {String} id page id
     * @param {Object} params params for next page
     * @param {Function} callback
     * @private
     */
    _createPage: function(id, params, callback){
        if(typeof this.pages[id] !== 'function'){
            this.pages[id] = $.EasyTouch.Page.extend(this.pages[id]);
        }
        this._pages[id] = new this.pages[id]({
            id: id,
            params: params,
            app: this
        });

        if(!callback){
            return;
        }
        if(this._pages[id]._inited){
            callback()
        }else{
            this._pages[id].bind(EVN_PAGE_INIT, callback);
        }
    },
    /**
    向App添加一个页面

        app.addPage('DetailPage', {
            html: '#DetailPage'
        });

    @method addPage
    @param id page id
    @param {String|Object} params 参数与调用`$.EasyTouch.Page.extend`时一致，内部会调用该方法扩展一个Page类
    **/
    addPage: function(id, params){
        this.pages[id] = params;
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
        return this._history.length?this._pages[this._history[this._history.length - 1].id]:null;
    },
    /**
     * 获取当前页面的ID
     * @method getCurrentPID
     * @return {String} the page id
     */
    getCurrentPID: function(){
        return this._history.length?this._history[this._history.length - 1].id:null;
    },
    /**
     * 显示加载中提示
     * @method showLoading
     * @param {Object} params
     *      @param {String} params.msg 需要显示的文案
     *      @param {Boolean} params.modal 加载中提示是否覆盖住应用禁止操作
     */
    showLoading: function(params){
        params = params || {};
        var msg = params.msg || '',
            modal = !!params.modal,
            className = CLASS_PREFIX+'load',
            $load = this.$el.find('.'+className);
        if($load.length){
            $load.text(msg).data('modal', modal).show();
        }else{
            this.$el.append('<div class="'+className+'" data-modal="'+modal+'"></div>');
        }
    },
    /**
     * 隐藏加载中提示
     * @method hideLoading
     */
    hideLoading: function(){
        $('.'+CLASS_PREFIX+'load').hide();
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
            启用单页面刷新功能, 并开始记录页面跳转, 如果存在历史记录, 则跳转至最后一条历史记录, 反之跳转至params中指定的页面

                app.history.start({
                    id: 'IndexPage',
                    params: {
                        name: 'YouXiao'
                    }
                })

            @method history.start
            @param {Object} params data to call navPage when the history is empty
                 @param {String} params.id page id
                 @param {Object} params.params params for the default page
            **/
            start: function(params){
                useHistory = true;
                if(_this._history.length){
                    var record = _this._history[_this._history.length - 1];
                    _this.navPage(record.id, record.params);
                }else{
                    _this.navPage(params.id, params.params);
                }
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
             * 增加一条历史记录,并写入`sessionStorage`
             * @method history.add
             * @param {Object} record
             *      @param {String} record.id page id
             *      @param {Object} record.params params for navPage
             *      @param {String} record.anim the animation name
             * @private
             */
            push: function(record){
                var lastPID = _this.getCurrentPID(),
                    firstPID = _this._history.length && _this._history[0].id;
                if(record.id !== lastPID && record.id !== firstPID){
                    _this._history.push(record);
                }else if(record.id === lastPID){
                    //相等时，仅更新params参数
                    _this._history[_this._history.length - 1].params = record.params;
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
},{
},{
    /**
    通过该方法来继承并扩展一个`$.EasyTouch`

        var App = $.EasyTouch.extend({
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
                'tap .back': this.app.back
            },
            //this function will run when creating instance
            init: function(params){},
            //for YunOS resume event
            resume: function(){},
            //for YunOS suspend event
            pause: function(){},
            //［子应用］第二次`navApp`到子应用时，调用子应用的reset方法
            reset: function(params){},
            //［宿主应用］从子应用回到宿主应用时调用宿主应用的back方法
            back: function(params){}
        });
        new App();

    @method $.EasyTouch.extend
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
    @return {Function} the new Class extended from `$.EasyTouch`
    @static
    **/
    extend: function(property){
        return $.Base.extend('', $.EasyTouch, property);
    }
});
$.extend($.EasyTouch.prototype, DelegateEvents.prototype);

/**
 * EasyTouch的子模块Page
 *
 * @module EasyTouch
 * @submodule EasyTouch-Page
 */

/**
页面类，该类不需要应用自己实例化，EasyTouch会在`navPage`时判断是否实例化了该页面，如果没有会自动实例化，你需要做的就是用`$.EasyTouch.Page.extend`方法扩展一个Page类，然后配置到APP中：

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
    @param {Object} options.params property add to `$.EasyTouch.Page`
    @param {Object} options.app the instance of `$.EasyTouch`, the page is in which app
@constructor
 **/
var
    /**
     页面第一次被访问时会促发该事件
     @event init
     @param {Object} e event object from custom-event
     @param {Object} params the params from `navPage`
     @private
     **/
    EVN_PAGE_INIT = 'init',
    /**
     除了第一次初始化时,页面每一次被访问时都会促发该事件
     @event reset
     @param {Object} e event object from custom-event
     @param {Object} params the params from `navPage`
     **/
    EVN_PAGE_RESET = 'reset',
    /**
     每一次离开页面后促发该事件
     @event leave
     **/
    EVN_PAGE_LEAVE = 'leave',
    /**
     页面每一次页面完全切换完成(初始化完成,动画完成)都会执行该方法
     @event ready
     @param {Object} e event object from custom-event
     @param {Object} params the params from `navPage` or `pageBack`
     **/
    EVN_PAGE_READY = 'ready';
$.EasyTouch.Page = $.Base.build('$.EasyTouch.Page', {
    /**
     * `html`和`tpl`属性二选一，`html`将一段HTML作为一个页面，它可以来至：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
     * @property html
     * @type HTMLElement|Node|String
     * @optional
     */
    html: undefined,
    /**
     * 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的`innerHTML`作为模板，可以在`render`方法中使用任意模板引擎渲染改模板
     * @property tpl
     * @type HTMLElement|Node|String
     * @optional
     */
    tpl: undefined,
    /**
     * Page的id，用于`navPage`等操作时的索引
     * @property id
     * @type String
     */
    id: undefined,
    /**
     * 代理的事件列表，`handler`可是一个字符串也可以是一个`function`，当是字符串时，将访问`this['nav']`
     *
     *      {
     *          'tap #contariner header': 'nav',
     *          'tap #contariner': function(){}
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

    initializer: function(options){
        this.app.log('[EasyTouch.Page] '+options.id+' initializer', arguments);

        this.app = options.app;
        var _this = this,
            params = options.params,
            eventParams = {
                id: options.id,
                params: $({}, params)
            },
            init = function(el){
                el.attr('id', options.id);
                el.addClass(CLASS_PREFIX + 'page');
                _this.app.$el.append(el);
                _this.id = options.id;
                _this.$el = el;
                _this.el = _this.$el[0];
                setTimeout(function(){
                    _this.delegateEvents(_this.events);
                    _this.init(params);
                    _this._inited = true;
                    _this.trigger(EVN_PAGE_INIT);
                }, TIME_WAIT_FOR_RENDER);
            };

        this.bind(EVN_PAGE_RESET, function(e, params){
            _this.reset(params);
        });
        this.bind(EVN_PAGE_LEAVE, function(e){
            _this.leave();
        });
        this.bind(EVN_PAGE_READY, function(e, params){
            _this.ready(params);
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
                        response = _this.render(response, params);
                        init($(response));
                    },
                    error: function(){
                        _this.app.trigger(EVN_APP_PAGE_LOAD_ERROR, eventParams);
                    }
                });
            //div / document.getElementsByTagName('div')[0]
            }else if(REGEX_SELECTOR.test(this.tpl) || this.tpl.tagName){
                init($(_this.render($(this.tpl).html(), params)));
            //$('div') zepto is $.zepto.Z / jquery is $
            }else if(this.tpl instanceof $.zepto.Z || this.tpl instanceof $){
                init($(_this.render(this.tpl.html(), params)));
            //<div>{{content}}</div>
            }else{
                init($(_this.render(this.tpl, params)));
            }
        }else{
            console.error('html or tpl is require');
        }
    },
    /**
     * 当页面作为一个模板被加入App前,可以通过该方法渲染模板,默认原样返回
     * @method render
     * @param {String} template the html before render
     * @param {Object} params the params from `navPage`
     * @return {String} the html after render
     */
    render: function(template, params){
        this.app.log('[EasyTouch.Page] render');
        return template;
    },
    /**
     * 页面第一次被访问时会执行该方法
     * @method init
     * @param {Object} params the params from `navPage`
     */
    init: function(params){
        this.app.log('[EasyTouch.Page] '+this.id+' init', arguments);
    },
    /**
     * 除了第一次初始化时,页面每一次被访问时都会执行该方法,
     * 初始化时如果需要执行reset方法,请自行在init方法中调用
     * @method reset
     * @param {Object} params the params from `navPage` or `pageBack`
     */
    reset: function(params){
        this.app.log('[EasyTouch.Page] '+this.id+' reset', arguments);
    },
    /**
     * 页面每一次页面完全切换完成(初始化完成,动画完成)都会执行该方法
     * @method ready
     * @param {Object} params the params from `navPage` or `pageBack`
     */
    ready: function(params){
        this.app.log('[EasyTouch.Page] '+this.id+' ready', arguments);
    },
    /**
     * 每一次离开页面后执行该方法
     * @method leave
     */
    leave: function(){
        this.app.log('[EasyTouch.Page] '+this.id+' leave');
    }
},{
    /**
     * Page的id，用于`navPage`等操作时的索引
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
     * @attribute params
     * @type Object
     */
    params: {}
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
                'tap header': 'tapHeader',
                'tap .back': this.app.back
            },
            render: function(template, params){
                return Mustache.to_html(template, params);
            },
            init: function(){

            },
            reset: function(){

            },
            ready： function(){

            },
            leave： function(){

            },
            tapHeader: function(){

            }
        });

    @method $.EasyTouch.Page.extend
    @param {Object} property property or function add to `$.EasyTouch.Page`
        @param {HTMLElement|Node|String} property.html `html`和`tpl`属性二选一，`html`将一个节点作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
        @param {HTMLElement|Node|String} property.tpl 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的`innerHTML`作为模板，可以在`render`方法中使用任意模板引擎渲染改模板
    @return {Function} the new Class extended from `$.EasyTouch.Page`
    @static
     **/
    extend: function(property){
        return $.Base.extend('', $.EasyTouch.Page, property);
    }
});
$.extend($.EasyTouch.Page.prototype, DelegateEvents.prototype);

})();