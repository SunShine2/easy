//seed配置
(function($E){
	//seed配置
	/*注:seajs不支持循环引用
     *因此用户在其他地方定义的模块别名不支持多次引用
     */
    var ROOT = 'http://wireless.aliyun-inc.com/easy/',
        LIB = ROOT + 'lib/',
        SRC = ROOT + 'src/',
        STYLE = SRC + 'css/',
        HALO = 'http://wireless.aliyun-inc.com/halo/';
        
    var alias_lib = {
        'iscroll' : 'iscroll/4.2/iscroll.js',
        'iscroll-lite' : 'iscroll/4.2/iscroll-lite.js',
        'less' : 'less/less-1.3.0.min.js',
        'ajax' : {path:'zepto/ajax.js', requires:'core'},
        'assets' : {path:'zepto/assets.js', requires:'core'},
        'data' : {path:'zepto/data.js', requires:'core'},
        'detect' : {path:'zepto/detect.js', requires:'core'},
        'event' : {path:'zepto/event.js', requires:'core'},
        'form' : {path:'zepto/form.js', requires:'core'},
        'fx' : {path:'zepto/fx.js', requires:'core'},
        'fx_methods' : {path:'zepto/fx_methods.js', requires:'core'},
        'gesture' : {path:'zepto/gesture.js', requires:'core'},
        'polyfill' : {path:'zepto/polyfill.js', requires:'core'},
        'selector' : {path:'zepto/selector.js', requires:'core'},
        'stack' : {path:'zepto/stack.js', requires:'core'},
        'touch' : {path:'zepto/touch.js', requires:'core'},
        'zepto' : 'zepto/zepto.js'
    };
    
    var alias_src = {
        'core' : 'core/core.js',
        'anim' : {path:'anim/anim.js', requires:['core']},
        'custom-event' : {path:'custom-event/custom-event.js', requires:['core']},
        'base' : {path:'base/base.js', requires:['custom-event']},
        'cache' : {path:'cache/cache.js', requires:['core']},
        'caf' : {path:'caf/caf.js', requires:['core']},
        'queue' : {path:'queue/queue.js', requires:['core']},
        
        'calendar-css' : 'calendar/calendar.css',
        'calendar' : {path:'calendar/calendar.js', requires:['calendar-css','core']},
        'slider-css':'slider/slider.css',
        'slider' : {path:'slider/slider.js', requires:['core']},
        'loading' : {path:'loading.js/loading.js', requires:['core']},
        
        'easytouch-css-core':'easytouch/css/core.css',
        'easytouch-css-anim':'easytouch/css/anim.css',
        'easytouch-less-core':'easytouch/less/core.less',
        'easytouch-less-anim':'easytouch/less/anim.less',
        'easytouch' : {path:'easytouch/js/core.js', requires:['easytouch-css-core','css-reset','base']},
        
        'plugin-less':{path:'loader/plugin-less.js',requires:['less']}
        
    };
    
    var alias_style = {
        'less-common':'less/common.less',
        'css-reset' : 'reset.css',
        'css-common' : 'common.css'
    };
    
    var preload = [
        'plugin-less','calendar','slider'
    ];
    
    //已经预处理build时不需加载的模块列表,如less支持模块
    var exclude = [
        'less','plugin-less'
    ];
	
    var seed = [
        {path:LIB,alias:alias_lib},
        {path:SRC,alias:alias_src},
        {path:STYLE,alias:alias_style}
    ];
	
	var HTTP_RE = /^https?:.*/;
	var _alias = {};
	for(var i = 0; i < seed.length; i++){
        var alias = seed[i].alias,
            path = seed[i].path,
            a;
        for(a in alias){
            if(alias.hasOwnProperty(a)){
                if(typeof alias[a] === 'string'){
                    alias[a] = path + alias[a];
                } else {
                    alias[a].path = path + alias[a].path;
                }
                _alias[a] = alias[a];
            }
        }
	}
	$E.config({
		alias : _alias,
		preload : preload,
		_exclude : exclude  //私有配置,非seajs配置信息
	});
})($E);