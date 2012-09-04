/**
 * core模块，用于在不修改zepto源代码的基础上增加其他必须的功能
 * @author : butian.wth
 * @version : 0-0-1
 */

define('easy',['core'],function(require, exports, module){
    var $ = require('core');

    /**
     * 增加type方法，用于支持Base模块
     * @type {Object}
     */
    var class2type = {};
    $.each("Boolean Number String Function Array Date RegExp Object".split(" "), function (i, name) {
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });
    $.type = function (obj) {
        return obj == null ?
            String(obj) : class2type[ toString.call(obj) ] || "object"
    };
    
    module.exports = $;
});