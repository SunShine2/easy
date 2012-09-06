/**
 * Easy Touch
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @beta
 */
;(function(){
var
    /**
    页面切换完成时促发，包括<code>navPage</code>和<code>pageBack</code>

        var app = new EasyTouch({...});
        app.bind('pageChange', function(e, params){
            var fromPage = this.getPage(params.from);
        }, app);

    @event pageChange
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_CHANGE = 'pageChange',
    /**
    <code>pageBack</code>完成时促发
    @event pageBack
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_BACK = 'pageBack',
    /**
    <code>navPage</code>完成时促发
    @event navPage
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_NAV = 'navPage',
    /**
    <code>navPage</code>开始前促发
    @event beforeNavPage
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_NAV = 'beforeNavPage',
    /**
    <code>navPage</code>或者<code>pageBack</code>开始前促发
    @event beforePageChange
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_CHANGE = 'beforePageChange',
    /**
    <code>pageBack</code>开始前促发
    @event beforePageBack
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_BACK = 'beforePageBack',
    /**
     * 退出应用时促发
     * @event exit
     * @private
     */
    EVN_APP_EXIT = 'exit',
    /**
     * 用<code>navApp</code>第二次进入应用时促发
     * @event reset
     * @private
     */
    EVN_APP_RESET = 'reset',
    /**
     * <code>navApp</code>后促发
     * @event navApp
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_NAV = 'navApp',
    /**
     * <code>navApp</code>前促发
     * @event beforeNavApp
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_BEFORE_NAV = 'beforeNavApp',
    /**
     * 第一次加载子应用时促发
     * @event beforeLoadApp
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_BEFORE_LOAD = 'beforeLoadApp',
    /**
     * 第一次加载子应用完成时促发
     * @event loadApp
     * @param {Object} e event object from custom-event
     * @param {Object} params
     *      @param {String} params.id the target app's id
     *      @param {Object} params.params the params for the target app
     */
    EVN_APP_LOAD = 'loadApp',
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
EasyTouch，为移动设备设计的UI框架。使用方法：用<code>$.EasyTouch.extend</code>方法扩展一个App类，然后初始化。<code>extend</code>的具体说明，请看<code>$.EasyTouch.extend</code>；参数<code>pages</code>的说明请看<code>$.EasyTouch.Page</code>：

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
     * 代理的事件列表，<code>handler</code>可是一个字符串也可以是一个<code>function</code>，当是字符串时，将访问<code>this['nav']</code>
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
    initializer: function(options){
        if(window.location.href.indexOf(MARK_CHILD_APP) !== -1){
            try{
                options = JSON.parse(decodeURIComponent(window.location.search.substring(MARK_CHILD_APP.length + 2)));
            }catch(ex){}
            this.host = {
                window: window.parent
            }
        }

        console.log('[EasyTouch] initializer', options);

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

        //child app message
        window.addEventListener('message', function(e){
            console.log('[EasyTouch] onmessage', e);

            var data = e.data;
            if(data.event === EVN_APP_EXIT){
                _this._apps[data.id] && _this._apps[data.id].$el.hide();
                _this._active = true;
                delete data.event;
                _this.back(data);
            }else if(data.event === EVN_APP_RESET){
                _this.reset(data.params);
            }
        });

        this.init(options);
    },
    /**
     * EasyTouch初始化
     * @method init
     * @param {Object} options
     */
    init: function(options){
        console.log('[EasyTouch] init', arguments);
    },
    /**
     * YunOS的resume事件监听
     * @method resume
     */
    resume: function(){
        console.log('[EasyTouch] resume', arguments);
    },
    /**
     * YunOS的pause事件监听
     * @method pause
     */
    pause: function(){
        console.log('[EasyTouch] pause', arguments);
    },
    /**
     * 第二次<code>navApp</code>之后调用
     * @method reset
     * @param {Object} params params for the target app
     */
    reset: function(params){
        console.log('[EasyTouch] reset', arguments);
    },
    /**
     * 从子应用回到宿主应用时调用
     * @method back
     * @param {Object} params when the child app call <code>exit</code>
     */
    back: function(params){
        console.log('[EasyTouch] back', arguments);
    },
    /**
     * 退出应用
     * @method exit
     * @param {Object} params the params for the parent app, the parent app can get the params from <code>back</code>
     */
    exit: function(params){
        console.log('[EasyTouch] exit', arguments);

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
     * 按云键
     * @method resetbutton
     */
    resetbutton: function(){
        console.log('[EasyTouch] resetbutton', arguments);
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
                event: EVN_APP_RESET,
                params: _params
            }, '*');
            this._apps[id].$el.show();
        }else{
            var url = this.apps[id];
            try{
                url += '?' + MARK_CHILD_APP + '=' + encodeURIComponent(JSON.stringify(_params));
            }catch(ex){}
            this.trigger(EVN_APP_BEFORE_LOAD, data);
            var iframe = $('<iframe src="'+url+'" class="'+CLASS_PREFIX+'app"></iframe>').bind('load', function(){
                _this.trigger(EVN_APP_LOAD, data);
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
     @return {Object} <code>app</code>: {HTMLElement} app.el the iframe of app; {Node} app.$el the iframe of app; {HTMLElement} app.window the contentWindow of iframe
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
        console.log('[EasyTouch] navPage', arguments);

        var currentPage = this.getCurrentPage();
        if(currentPage && currentPage.id === id){
            return;
        }

        var _this = this,
            _params = $.extend({}, params),
            eventArgus = {
                from: currentPage?currentPage.id:undefined,
                to: id,
                params: params,
                anim: anim
            },
            pushHistory = function(id, params, anim, ifPushToHistory){
                if(!ifPushToHistory){
                    return;
                }
                this.history.push({
                    id: id,
                    params: params,
                    anim: anim
                });
            },
            trigger = function(){
                pushHistory.apply(_this, [id, params, anim, ifPushToHistory !== false]);
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
    @param {String} anim animation name, as same as <code>navPage</code>
    **/
    pageBack: function(params, anim){
        console.log('[EasyTouch] pageBack', arguments);
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
        if(!fromPage){
            this.$el.find('.' + CLASS_PREFIX + 'page').hide(); //TODO: 但页面刷新时，需要隐藏页面上写死的Page
            toPage.$el.show();
            toPage.trigger(EVN_PAGE_READY, params);
            callback && callback();
            return;
        }
        if(anim){
            anim = CLASS_PREFIX + anim;
            var reverseClass = reverseAnimation(anim),
                c_class = CLASS_PREFIX + 'current';
            fromPage.$el.bind('webkitAnimationEnd', function(){
                fromPage.$el.hide().removeClass(reverseClass).unbind('webkitAnimationEnd');
                fromPage.trigger(EVN_PAGE_LEAVE);
            }).removeClass(c_class).addClass(reverseClass);
            toPage.$el.bind('webkitAnimationEnd', function(){
                toPage.$el.removeClass(anim).unbind('webkitAnimationEnd');
                toPage.trigger(EVN_PAGE_READY, params);
                callback && callback();
            }).addClass(c_class).addClass(anim).show();
        }else{
            fromPage.$el.hide();
            toPage.$el.show();
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
            el: '#DetailPage'
        });

    @method addPage
    @param id page id
    @param {String|Object} params
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
    history: function(){
        var _this = this, useHistory;
        if(sessionStorage.getItem(SESSION_HISTORY)){
            this._history = JSON.parse(sessionStorage.getItem(SESSION_HISTORY));
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
             * 从尾部删除一条历史记录,并写入<code>sessionStorage</code>
             * @method history.pop
             * @private
             */
            pop: function(){
                _this._history.pop();
                _this.history.save();
            },
            /**
             * 增加一条历史记录,并写入<code>sessionStorage</code>
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
                }
                if(record.id === firstPID){
                    _this._history.length = 1;
                }
                _this.history.save();
            },
            /**
             * 将内存中的历史记录写入<code>sessionStorage</code>
             * @method history.save
             * @private
             */
            save: function(){
                if(!useHistory){
                    return;
                }
                sessionStorage.setItem(SESSION_HISTORY, JSON.stringify(_this._history));
            }
        }
    }
},{
},{
    /**
    通过该方法来继承并扩展一个<code>$.EasyTouch</code>

        var App = $.EasyTouch.extend({
            id: 'market',
            container: '#app',
            pages: {

            },
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
            pause: function(){}
        });
        new App();

    @method $.EasyTouch.extend
    @param {Object} options 需要扩展的属性列表
        @param {String} options.id 应用ID，用于EasyTouch内部识别
        @param {Node|HTMLElement|String} options.container 应用容器，默认为<code>body</code>
        @param {Object} options.pages 页面配置：
        如果是一个Object，EasyTouch会调用<code>$.EasyTouch.Page.extend</code>，将这个Object作为prototype属性扩展出一个Page，具体请看<code>$.EasyTouch.Page.extend</code>；
        如果是一个<code>$.EasyTouch.Page.extend</code>产生的Class，则将直接使用该类作为一个Page；
        @param {Object} options.apps 子应用配置：key为应用的id，value为应用的访问地址，子应用将作为一个iframe的形式存在
    @return {Function} the new Class extended from <code>$.EasyTouch</code>
    @static
    **/
    extend: function(property){
        return $.Base.extend('', $.EasyTouch, property);
    }
});
$.extend($.EasyTouch.prototype, DelegateEvents.prototype);


/**
页面类，该类不需要应用自己实例化，EasyTouch会在<code>navPage</code>时判断是否实例化了该页面，如果没有会自动实例化，你需要做的就是用<code>$.EasyTouch.Page.extend</code>方法扩展一个Page类，然后配置到APP中：

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
@param {Object} options
    @param {String} options.id page id
    @param {Object} options.params property add to <code>$.EasyTouch.Page</code>
    @param {Object} options.app the instance of <code>$.EasyTouch</code>, the page is in which app
@constructor
 **/
var
    /**
     页面第一次被访问时会促发该事件
     @event init
     @param {Object} e event object from custom-event
     @param {Object} params the params from <code>navPage</code>
     **/
    EVN_PAGE_INIT = 'init',
    /**
     除了第一次初始化时,页面每一次被访问时都会促发该事件
     @event reset
     @param {Object} e event object from custom-event
     @param {Object} params the params from <code>navPage</code>
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
     @param {Object} params the params from <code>navPage</code> or <code>pageBack</code>
     **/
    EVN_PAGE_READY = 'ready';
$.EasyTouch.Page = $.Base.build('$.EasyTouch.Page', {
    /**
     * <code>html</code>和<code>tpl</code>属性二选一，<code>html</code>将一段HTML作为一个页面，它可以来至：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
     * @property html
     * @type HTMLElement|Node|String
     * @optional
     */
    html: undefined,
    /**
     * 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的<code>innerHTML</code>作为模板，可以在<code>render</code>方法中使用任意模板引擎渲染改模板
     * @property tpl
     * @type HTMLElement|Node|String
     * @optional
     */
    tpl: undefined,
    /**
     * Page的id，用于<code>navPage</code>等操作时的索引
     * @property id
     * @type String
     */
    id: undefined,
    /**
     * 代理的事件列表，<code>handler</code>可是一个字符串也可以是一个<code>function</code>，当是字符串时，将访问<code>this['nav']</code>
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
        console.log('[EasyTouch.Page] '+options.id+' initializer', arguments);

        var params = options.params;
        this.app = options.app;
        var _this = this;
        var init = function(el){
            el.attr('id', options.id);
            el.addClass(CLASS_PREFIX + 'page');
            _this.app.$el.append(el);
            setTimeout(function(){
                _this.id = options.id;
                _this.$el = el;
                _this.el = _this.$el[0];
                _this.delegateEvents(_this.events);
                _this.init(params);
                _this._inited = true;
                _this.trigger(EVN_PAGE_INIT);
            }, 0);
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
            if(REGEX_HTML_ADRESS.test(this.html)){
                $.get(this.html, function(response){
                    init($(response));
                });
            }else if(typeof this.html === 'string' || this.html.tagName){
                init($(this.html));
            }else{
                init(this.html);
            }
        }else if(this.tpl){
            if(REGEX_HTML_ADRESS.test(this.tpl)){
                $.get(this.tpl, function(response){
                    response = _this.render(response, params);
                    init($(response));
                });
            }else if(REGEX_SELECTOR.test(this.tpl) || this.tpl.tagName){
                init($(_this.render($(this.tpl).html(), params)));
            }else if(this.tpl.attr){
                init($(_this.render(this.tpl.html(), params)));
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
     * @param {Object} params the params from <code>navPage</code>
     * @return {String} the html after render
     */
    render: function(template, params){
        console.log('[EasyTouch.Page] render');
        return template;
    },
    /**
     * 页面第一次被访问时会执行该方法
     * @method init
     * @param {Object} params the params from <code>navPage</code>
     */
    init: function(params){
        console.log('[EasyTouch.Page] '+this.id+' init', arguments);
    },
    /**
     * 除了第一次初始化时,页面每一次被访问时都会执行该方法,
     * 初始化时如果需要执行reset方法,请自行在init方法中调用
     * @method reset
     * @param {Object} params the params from <code>navPage</code> or <code>pageBack</code>
     */
    reset: function(params){
        console.log('[EasyTouch.Page] '+this.id+' reset', arguments);
    },
    /**
     * 页面每一次页面完全切换完成(初始化完成,动画完成)都会执行该方法
     * @method ready
     * @param {Object} params the params from <code>navPage</code> or <code>pageBack</code>
     */
    ready: function(params){
        console.log('[EasyTouch.Page] '+this.id+' ready', arguments);
    },
    /**
     * 每一次离开页面后执行该方法
     * @method leave
     */
    leave: function(){
        console.log('[EasyTouch.Page] '+this.id+' leave');
    }
},{
    /**
     * Page的id，用于<code>navPage</code>等操作时的索引
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
    通过该方法来继承并扩展一个<code>$.EasyTouch.Page</code>：

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
    @param {Object} property property or function add to <code>$.EasyTouch.Page</code>
        @param {HTMLElement|Node|String} property.html <code>html</code>和<code>tpl</code>属性二选一，<code>html</code>将一个节点作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
        @param {HTMLElement|Node|String} property.tpl 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的<code>innerHTML</code>作为模板，可以在<code>render</code>方法中使用任意模板引擎渲染改模板
    @return {Function} the new Class extended from <code>$.EasyTouch.Page</code>
    @static
     **/
    extend: function(property){
        return $.Base.extend('', $.EasyTouch.Page, property);
    }
});
$.extend($.EasyTouch.Page.prototype, DelegateEvents.prototype);

})();