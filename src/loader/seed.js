//seed配置
(function($E){
    var ROOT = 'http://wireless.aliyun-inc.com/easy/',
        LIB = ROOT + 'lib/',
        SRC = ROOT + 'src/',
        STYLE = SRC + 'css/',
        ZEPTO = ROOT + 'lib/zepto',
        HALO = 'http://wireless.aliyun-inc.com/halo/';
        
    var alias_lib = {
        'iscroll' : 'iscroll/4.2/iscroll.js',
        'iscroll-lite' : 'iscroll/4.2/iscroll-lite.js',
        'mustache' : 'mustache/0.7.0/mustache.js',
        'less' : 'less/less-1.3.0.min.js'
    };
    
    var alias_zepto = {
        'zepto' : 'zepto/zepto.js',
        'zepto-ajax' : {path:'zepto/ajax.js', requires:'zepto'},
        'zepto-assets' : {path:'zepto/assets.js', requires:'zepto'},
        'zepto-data' : {path:'zepto/data.js', requires:'zepto'},
        'zepto-detect' : {path:'zepto/detect.js', requires:'zepto'},
        'zepto-event' : {path:'zepto/event.js', requires:'zepto'},
        'zepto-form' : {path:'zepto/form.js', requires:'zepto'},
        'zepto-fx' : {path:'zepto/fx.js', requires:'zepto'},
        'zepto-fx_methods' : {path:'zepto/fx_methods.js', requires:'zepto'},
        'zepto-gesture' : {path:'zepto/gesture.js', requires:'zepto'},
        'zepto-polyfill' : {path:'zepto/polyfill.js', requires:'zepto'},
        'zepto-selector' : {path:'zepto/selector.js', requires:'zepto'},
        'zepto-stack' : {path:'zepto/stack.js', requires:'zepto'},
        'zepto-touch' : {path:'zepto/touch.js', requires:'zepto'}
    };
    
    var alias_halo = {
        'jsCloudAPI' : 'dist/JsCloudAPI-1.0.0beta.js',
        'halo' : 'dist/halo-1.0.0beta.js'
    };
    
    var alias_src = {
        'core' : 'core/core.js',
        'anim' : {path:'anim/anim.js', requires:['core']},
        'events' : {path:'custom-event/events.js', requires:['core']},
        'base' : {path:'base/base.js', requires:['custom-event']},
        'cache' : {path:'cache/cache.js', requires:['core']},
        'caf' : {path:'caf/caf.js', requires:['core']},
        'callbacks' : {path:'callbacks/callbacks.js',requires:['core']},
        'deferred' : {path:'deferred/deferred.js',requires:['core']},
        'deferred-ajax' : {path:'deferred/deferred-ajax.js',requires:['deferred']},
        
        'calendar-css' : 'calendar/calendar.css',
        'calendar' : {path:'calendar/calendar.js', requires:['calendar-css','core']},
        'slider-css':'slider/slider.css',
        'slider' : {path:'slider/slider.js', requires:['core']},
        'loading' : {path:'loading.js/loading.js', requires:['core']},
        
        'easytouch-css-core':'easytouch/css/core.css',
        'easytouch-css-anim':'easytouch/css/anim.css',
        'easytouch-less-core':'easytouch/less/core.less',
        'easytouch-less-anim':'easytouch/less/anim.less',
        'easytouch-model' : {path:'easytouch/js/model.js',requires:['base']},
        'easytouch' : {path:'easytouch/js/core.js', requires:['easytouch-css-core','css-reset','base']},
        'plugin-less':{path:'loader/plugin-less.js',requires:['less']},
        'plugin-app':{path:'loader/plugin-app.js'}
        
    };
    
    var alias_style = {
        'less-common':'less/common.less',
        'css-reset' : 'reset.css',
        'css-common' : 'common.css'
    };
    
    var preload = [
        'plugin-less','jsCloudAPI','halo'
    ];
    
    //已经预处理build时不需加载的模块列表,如less支持模块
    var exclude = [
        'less','plugin-less'
    ];
    
    //调试时会包含,打包时不包含
    var exclude_onbuild = [
        'jsCloudAPI'
    ];
	
    var seed = [
        {path:LIB,alias:alias_lib},
        {path:ZEPTO,alias:alias_zepto},
        {path:SRC,alias:alias_src},
        {path:STYLE,alias:alias_style},
        {path:HALO,alias:alias_halo}
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
		_exclude : exclude,  //私有配置
		_exclude_onbuild: exclude_onbuild
	});
})($E);