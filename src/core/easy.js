/**
 * core模块，用于在不修改zepto源代码的基础上增加其他必须的功能
 * @author : butian.wth
 * @version : 0.0.2
 */
define('easy-core', ['zepto-core'], function ($) {

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
    /**
     用于对绑定事件的对象进行唯一的标志
     @property _zid
     @type number
     @private
     */
    var _zid = 1;
    /**
    对事件所在对象进行绑定的函数
    @param element {Object} 事件所绑定的对象
    @return {*}
    */

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }

    /**
    用于在外部访问到标志对象的方法
    @property ceHandlers
    @type object
    @static
    */
    $.zid = zid;

    return $;

});