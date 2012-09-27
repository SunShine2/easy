/**
用于组件的自定义事件系统
@author: butian.wth
@version : 0.0.2
@module : CustomEvent
*/
;(function(){
   
    var handlers = {},
        BEFORE_EVENT = 'before',
        AFTER_EVENT = 'after',
        CUSTOMEVENT = 'customEvents',
        zid = $.zid;

    /**
    用于在外部访问到所有绑定的事件
    @property ceHandlers
    @type object
    @static
    */
    $.ceHandlers = handlers;

    /**
    查找事件的函数
    @param event {String} 传入的事件名
    @param fn {Function} 事件对应的回调函数
    @param agent {Object} 事件所在的对象
    @return {*}
     */
    function findHandlers(event, fn, agent) {
        return (handlers[event] || []).filter(function (handler) {
            return handler
                && (!fn || zid(handler.fn) === zid(fn))
                && (!agent || handler.agent == agent)
        })
    }

    /**
    重排函数，用于对数组进行重排
    @param arr {Array} 需要重排的数组对象
     */
    
    function reIndex(arr) {
        arr.forEach(function (e, index) {
            e.i = index;
        });
    }

    /**
    对事件名进行包装
    @param evt {String} 事件名
    @param agent {Object} 事件所绑的对象
    @return {String}
     */
    function wrapName(evt, agent) {
        return agent.constructor.NAME ? agent.constructor.NAME + ':' + evt : evt;
    }

    /**
    队列系统，用于控制多个回调函数的执行
    @params flag {String} 用于区分队列的形式
     */
    $.Queue = function (flag) {
        var ret = [];

        ret.NAME = flag;

        ret.run = function () {
            ret.every(function (item) {
                return item.fn(item.event, item.data) !== false;
            })
        };

        return ret;
    };

    $.extend($, {
        /**
         * 绑定事件的通用方法
         *
         * @method bind
         * @param evt {String} 事件的名字
         * @param callback {Function} 事件所绑定的回调函数
         * @param option {Object} 事件绑定时要记录的参数
         * @param agent {Object} 事件绑定时所在的执行环境
         * @param flag {String} 标识符，用于判断是before还是after
         * @return {Object}
         */
        bind:function (evt, callback, option, agent, flag/*只在内部使用*/) {
            agent || (agent = window);
            var o = {type:evt},
                item = handlers[evt] || (handlers[evt] = []),
                proxyfn = function (e, data) {
                    return callback.apply(agent, [e].concat(data));
                };
            if (!agent) {

            }
            o = $.extend(o, {fn:callback, proxy:proxyfn, agent:agent});
            if (flag === BEFORE_EVENT) {
                item.unshift(o);
            } else {
                item.push(o);
            }
            reIndex(item);
            return o;
        },
        /**
         * 解绑事件的通用方法
         *
         * @method unbind
         * @param evt {String} 事件的名字
         * @param callback {Function} 事件所绑定的回调函数
         * @param agent {Object} 事件绑定时所在的执行环境
         */
        unbind:function (evt, callback, agent) {
            findHandlers(evt, callback, agent).forEach(function (handler) {
                delete handlers[evt][handler.i];
                reIndex(handlers[evt]);
            });
        },
        /**
         * 触发事件的方法
         *
         * @method trigger
         * @param evt {String} 事件的名字
         * @param data {Object} 触发事件时要传的数据
         * @param agent {Object} 事件绑定时所在的执行环境
         */
        trigger:function (evt, data, agent) {
            var queue = $.Queue(CUSTOMEVENT);
            findHandlers(evt, undefined, agent).forEach(function (item) {
                var o = {};
                o.fn = item.proxy;
                o.event = item;
                if (data) {
                    o.data = data;
                }
                o.option = item.option;
                queue.push(o);
            });
            queue.run();
        },
        /**
         * 绑事件绑定到事件队列的尾部，最后执行
         *
         * @method after
         * @param evt {String} 事件的名字
         * @param callback {Function} 事件所绑定的回调函数
         * @param option {Object} 事件绑定时要记录的参数
         * @param agent {Object} 事件绑定时所在的执行环境
         * @return {*}
         */
        after:function (evt, callback, option, agent) {
            return $.bind(evt, callback, option, agent, AFTER_EVENT)
        },
        /**
         * 绑事件绑定到事件队列的顶部，最先执行
         *
         * @method before
         * @param evt {String} 事件的名字
         * @param callback {Function} 事件所绑定的回调函数
         * @param option {Object} 事件绑定时要记录的参数
         * @param agent {Object} 事件绑定时所在的执行环境
         * @return {*}
         */
        before:function (evt, callback, option, agent) {
            return $.bind(evt, callback, option, agent, BEFORE_EVENT)
        }
    });

    /**
    # 自定义事件对象 #

    ##主要功能##
    提供自定义事件的支持

    ##事件对象的格式##

        {
            'eventName' : [
                {
                    'fn' : fn, //原函数
                    'proxy': proxyfn, //处理过后的回调函数
                    'i' : item.length, //eventName数组下对应的index位置
                    'agent' : agent, //回调函数执行的上下文
                    'type' : 'eventName' //事件名
                }
            ]
        }
    @class $.CustomEvent
    */

    $.CustomEvent = function(){
        this.bind = function (evt, callback, option) {
            evt = wrapName(evt, this);
            return $.bind(evt, callback, option, this)
        };
        this.unbind = function (evt, callback) {
            evt = wrapName(evt, this);
            return $.unbind(evt, callback, this)
        };
        this.trigger = function (evt, data) {
            evt = wrapName(evt, this);
            return $.trigger(evt, data, this)
        };
        this.before = function (evt, callback, option) {
            evt = wrapName(evt, this);
            return $.before(evt, callback, option)
        };
        this.after = function (evt, callback, option) {
            evt = wrapName(evt, this);
            return $.after(evt, callback, option)
        }
    }

})();
/**
change log
@20120827 增加name的处理，如果在模块内进行事件绑定，会有模块的前缀
 */