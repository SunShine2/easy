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
        app.bind('page:change', function(e, params){
            var fromPage = this.getPage(params.from);
        }, app);

    @event page:change
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_CHANGE = 'page:change',
    /**
    <code>pageBack</code>完成时促发
    @event page:back
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_BACK = 'page:back',
    /**
    <code>navPage</code>完成时促发
    @event page:nav
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_PAGE_NAV = 'page:nav',
    /**
    <code>navPage</code>开始前促发
    @event page:beforeNav
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_NAV = 'page:beforeNav',
    /**
    <code>navPage</code>或者<code>pageBack</code>开始前促发
    @event page:beforeChange
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String|Undefined} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_CHANGE = 'page:beforeChange',
    /**
    <code>pageBack</code>开始前促发
    @event page:beforeBack
    @param {Object} e event object from custom-event
    @param {Object} params
        @param {String} params.from page id of prev page
        @param {String} params.to page id of next page
        @param {Object|Undefined} params.params the params when you call <code>navPage</code> or <code>pageBack</code>
        @param {String|Undefined} params.anim the animation name
    **/
    EVN_APP_BEFORE_PAGE_BACK = 'page:beforeBack',
    CLASS_APP = 'easytouch',
    CLASS_PREFIX = 'et-',
    SESSION_HISTORY = 'easytouch:page_history',
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

/**
Touch UI Library for Easy, Examples:
####You can create a instance of EasyTouch:

    var Page1 = $.EasyTouch.Page.extend({
        el: '#xxx .xxx',
        init: function(){},
        reset: function(){}
    });

    new $.EasyTouch({
        pages: {
            //class inherit from $.EasyTouch.Page
            "Page1": Page1,

            //get html from el
            //html file
            "Page2": {
                el: 'xxx.html'
            },
            //css selector
            "Page3": {
                el: '#xxx'
            },
            //HTML Element
            "Page4": {
                el: document.getElementById('xxx')
            },
            //Zepto
            "Page5": {
                el: $('#xxx')
            },


            //get template from tpl, render the template in the function of <code>render</code>
            "Page6": {
                tpl: 'xxx.html'
            },
            "Page7": {
                tpl: '#xxx'
            },
            "Page8": {
                tpl: document.getElementById('xxx')
            },
            "Page9": {
                tpl: $('#xxx')
            }
        },
        //this function will run when creating instance
        init: function(params){},
        //for YunOS resume event
        resume: function(){},
        //for YunOS suspend event
        pause: function(){}
    });

####Or you can extend a EasyTouch, like this:

    var App = $.EasyTouch.extend({
        el: 'xxx',
        init: xxx
        ...
    });
    new App();

@class $.EasyTouch
@param {Object} options
    @param {Object} options.pages 页面配置：
        如果是一个Object，EasyTouch会调用<code>$.EasyTouch.Page.extend</code>，将这个Object作为prototype属性扩展出一个Page；
        如果是一个Class，则将直接使用该类作为一个Page；
        @param {HTMLElement|Node|String} options.pages.el <code>el</code>和<code>tpl</code>属性二选一，<code>el</code>将一个节点作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
        @param {HTMLElement|Node|String} options.pages.tpl 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的<code>innerHTML</code>作为模板，可以在<code>render</code>方法中使用任意模板引擎渲染改模板
@constructor
**/
$.EasyTouch = $.Base.build('$.EasyTouch', {
    initializer: function(options){
        console.log('[EasyTouch] initializer', options);

        var _this = this;
        $.extend(this, options);
        this.el = typeof this.el === 'string'?$(this.el):this.el;
        this.el.addClass(CLASS_APP);
        this.history = this.history();

        //yunos event
        $(document).bind('resume', function(e){
            _this.resume();
        }).bind('pause', function(e){
            _this.pause();
        }).bind('backbutton', function(e){
            _this.pageBack();
        }).bind('resetbutton', function(e){
            _this.reset();
        });

        this.init(options);
    },

    /**
     * Page实例
     * @property _pages
     * @type Object
     * @private
     */
    _pages: {},
    /**
     * 页面跳转的历史记录
     * @property _history
     * @type Array
     * @private
     */
    _history: [],
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
     * 重置应用
     * @method reset
     */
    reset: function(){
        console.log('[EasyTouch] reset');
        if(!this._history.length){
            return;
        }
        this.navPage(this._history[0].id, this._history[0].params);
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
    *   popIn
    *   flipLeftIn
    *   flipRightIn
    *   swapLeftIn
    *   swapRightIn
    *   cubeLeftIn
    *   cubeRightIn

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
            //TODO: exitApp
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
            toPage.el.show();
            toPage.trigger(EVN_PAGE_READY, params);
            callback && callback();
            return;
        }
        if(anim){
            anim = CLASS_PREFIX + anim;
            var reverseClass = reverseAnimation(anim),
                c_class = CLASS_PREFIX + 'current';
            fromPage.el.removeClass(c_class).addClass(reverseClass);
            toPage.el.bind('webkitAnimationEnd', function(){
                toPage.el.unbind('webkitAnimationEnd').removeClass(anim);
                fromPage.el.hide().removeClass(reverseClass);
                fromPage.trigger(EVN_PAGE_LEAVE);
                toPage.trigger(EVN_PAGE_READY, params);
                callback && callback();
            }).addClass(c_class).addClass(anim).show();
        }else{
            fromPage.el.hide();
            toPage.el.show();
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
    /**
     * 容器
     * @attribute el
     * @type HTMLElement|Node|String
     * @default 'body'
     * @optional
     */
    el: {
        value : 'body'
    },
    /**
     * Page原型
     * @attribute pages
     * @type Object
     * @required
     */
    pages: {
        value: {}
    }
},{
    /**
     * 通过该方法来继承并扩展一个<code>$.EasyTouch</code>
     * @method $.EasyTouch.extend
     * @param {Object} property property or function add to <code>$.EasyTouch</code>
     * @return {Function} the new Class extended from <code>$.EasyTouch</code>
     * @static
     */
    extend: function(property){
        return $.Base.extend('', $.EasyTouch, property);
    }
});


/**
页面类，该类不需要应用自己实例化，EasyTouch会在<code>navPage</code>时判断是否实例化了该页面，如果没有会自动实例化，
应用可以通过<code>$.EasyTouch.Page.extend</code>方法创建一个新的Page类：

    var Page1 = $.EasyTouch.Page.extend({
        //set el or tpl property, examples in $.EasyTouch example
        el: '#Page1',
        //el: document.getElementById('#Page1'),
        //el: $('#Page1'),
        //el: 'pages/Page1.html',

        //tpl: '#Page1',
        //tpl: document.getElementById('#Page1'),
        //tpl: $('#Page1'),
        //tpl: 'pages/Page1.html',

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

        }
    });

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
     * Page的id，用于<code>navPage</code>等操作时的索引
     * @property id
     * @type Object
     */
    id: undefined,
    /**
     * Page的$dom容器
     * @property el
     * @type Node
     */
    el: undefined,
    /**
     * EasyTouch实例，该page所属app的引用
     * @property app
     * @type Object
     */
    app: undefined,
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
        var _this = this,
            _init = function(el){
                el.attr('id', options.id);
                el.addClass(CLASS_PREFIX + 'page');
                _this.app.el.append(el);
                _this.el = el;
                _this.id = options.id;
                setTimeout(function(){
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

        if(this.el){
            if(REGEX_HTML_ADRESS.test(this.el)){
                $.get(this.el, function(response){
                    _init($(response));
                });
            }else if(typeof this.el === 'string' || this.el.tagName){
                _init($(this.el));
            }else{
                _init(this.el);
            }
        }else if(this.tpl){
            if(REGEX_HTML_ADRESS.test(this.tpl)){
                $.get(this.tpl, function(response, status){
                    response = _this.render(response, params);
                    _init($(response));
                });
            }else if(REGEX_SELECTOR.test(this.tpl) || this.tpl.tagName){
                _init($(_this.render($(this.tpl).html(), params)));
            }else if(this.tpl.attr){
                _init($(_this.render(this.tpl.html(), params)));
            }else{
                _init($(_this.render(this.tpl, params)));
            }
        }else{
            console.error('el or tpl param is require');
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
     * <code>el</code>和<code>tpl</code>属性二选一，<code>el</code>将一个节点作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如http://xxx.com/xxx.html）
     * @attribute el
     * @type HTMLElement|Node|String
     * @optional
     */
    el: {
        value: undefined
    },
    /**
     * 将一个模板作为一个页面，它可以是：原生的dom节点、Zepto对象、选择器、一个本地或远程的html文件（如tpl/xxx.html），对于前三者，EasyTouch会将它们的<code>innerHTML</code>作为模板，可以在<code>render</code>方法中使用任意模板引擎渲染改模板
     * @attribute tpl
     * @type HTMLElement|Node|String
     * @optional
     */
    tpl: {
        value: undefined
    }
},{
    /**
    通过该方法来继承并扩展一个<code>$.EasyTouch.Page</code>
    @method $.EasyTouch.Page.extend
    @param {Object} property property or function add to <code>$.EasyTouch.Page</code>
    @return {Function} the new Class extended from <code>$.EasyTouch.Page</code>
    @static
     **/
    extend: function(property){
        return $.Base.extend('', $.EasyTouch.Page, property);
    }
});
})();