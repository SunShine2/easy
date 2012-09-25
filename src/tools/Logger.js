/**
@module tools
**/
/**
`$.Logger`是一个支持目录过滤、格式显示的日志打印类。
    
    //prepare $.Logger
    $.Logger.level = 'info';
    $.Logger.filters = ['HomeView', 'HomeModel'];

    //create instances of $.Logger
    var logger = $.Logger.getLogger('HomeView');
    logger.level = 'info';
    logger.log('HomeView.init');
    logger.info('HomeView ready');
    logger.debug('HomeView receive data from model');


@class $.Logger
@extends $.Base
@constructor
**/
$.Logger = $.Base.build('$.Logger', {
    
    /**
    @property category
    @type String
    @default `~`
    **/
    category: '~',

    /**
    @property level
    @type String
    @default `log`
    **/
    level: 'log',
    
    /**
    @property enabled
    @type Boolean
    @default `true`
    **/
    enabled: true,
    
    /**
    @method initializer
    **/
    initializer: function(options){
        if(options.category){
            this.category = options.category;
        }
    },
    
    /**
    @method print
    @protected
    **/
    print: function(level, message){
        if(this.enabled && $.Logger.compareLevel(level, this.level) >= 0){
            $.Logger.print(level, this.category, message);
        }
    },
    /**
    @method log
    **/
    log: function(){
        this.print('log', arguments);
    },
    /**
    @method info
    **/
    info: function(){
        this.print('info', arguments);
    },
    /**
    @method debug
    **/
    debug: function(){
        this.print('debug', arguments);
    },
    /**
    @method warn
    **/
    warn: function(){
        this.print('warn', arguments);
    },
    /**
    @method error
    **/
    error: function(){
        this.print('error', arguments);
    }
}, null, {

    /**
    @property enabled
    @type Boolean
    @default `true`
    @static
    **/
    enabled: true,
    
    /**
    @property level
    @type String
    @default `log`
    @static
    **/
    level: 'log',

    /**
    @property format
    @static
    @type String
    @default `{-c} -m`
    **/
    format: '{-c} -m',

    
    /**
    @protected filters
    @static
    @type Array|RegExp
    @default `null`
    **/
    filters: null,
    /**
    @method compareLevel
    @static
    @private
    @param {String} l1
    @param {String} l2
    @return Number
    **/
    compareLevel: function(l1, l2){
        var arr = ['log', 'info', 'debug', 'warn', 'error'];
        arr.indexOf(l1) - arr.indexOf(l2);
    },

    /**
    @method validateFilters
    @static
    @protected
    @param {String} category
    @param {String} message
    @return Boolean
    **/
    validateFilters: function(category, message){
        var filters = this.filters;
        if(!filters){
            return true;
        }
        if($.type(filters) === 'string'){
            return category === filters;
        }else if($.type(filters) === 'array'){
            return filters.indexOf(category) !== -1;
        }else if($.type(filters.test) === 'function'){
            return filters.test(category + " " + message);
        }
        return false;
    },
    
    /**
    @method setFormat
    @static
    @param {String} format
    **/
    setFormat: function(format){
        if(!format){
            return;
        }
        if(/\-[ctml]/.test(format)){
            this.format = format;
        }
    },
    /**
    @method formatMessage
    @static
    @protected
    @param {String} level
    @param {String} category
    @param {Array} message
    @return String
    **/
    formatMessage: function(level, category, message){
        var s = "", msg = message ? message[0] : "";
        if(msg){
            if(typeof msg !== 'string'){
                msg = msg.toString();
            }
            var index = 0;
            msg = msg.replace(/(%[sd])/g, function(m, k){
                return message[++index];
            });
        }
        return this.format.replace(/\-([ctml])/g, function(m, k){
            if(k == 'c'){
                return category;
            }else if(k == 't'){
                return Date.now();
            }else if(k == 'm'){
                return msg;
            }else if(k == 'l'){
                return level;
            }
        });
    },
    /**
    @method getLogger
    @static
    @param {String} category
    @return `$.Logger`
    **/
    getLogger: function(category){
        return new $.Logger({category:category});
    },
    /**
    @method print
    @static
    @protected
    @param {String} level
    @param {String} category
    @param {String} message
    **/
    print: function(level, category, message){
        if(!this.enabled || !window.console){
            return;
        }
        if(this.compareLevel(level, this.level) < 0){
            return;
        }
        message = this.formatMessage(level, category, message);
        if(!this.validateFilters(category, message)){
            return;
        }
        switch(level){
            case 'log':
                console.log(message);break;
            case 'info':
                console.info(message);break;
            case 'debug':
                console.debug(message);break;
            case 'warn':
                console.warn(message);break;
            case 'error':
                console.error(message);break;
        }
    }
});