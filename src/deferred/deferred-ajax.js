/**
 * deferred-ajax
 * @author: youxiao@alibaba-inc.com
 * @version: 0-0-1
 * @module deferred-ajax
 * @uses Deferred Ajax
 * @description  ajax增强模块,支持ajax的promise模式
 */
;(function(){
    var EMPTY = function(){},
        ajax = $.ajax,
        ajaxJSONP = $.ajaxJSONP;

    $.ajax = function(options){
        var opt = options || {},
            success = opt.success,
            error = opt.error,
            def = $.Deferred();

        opt.success = function(data,status,xhr){
            success && success.call(opt.context,arguments);
            def.resolve(data,status,xhr);
        };

        opt.error = function(){
            error && error.call(opt.context,arguments);
            def.reject(xhr,type,error);
        };

        var xhr = ajax(opt);
        return def.promise(xhr);
    };
})(Zepto);