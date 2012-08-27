/**
 * 用于组件的自定义事件系统
 * author: butian.wth
 * version : 0-0-1
 **/

(function ($) {

    /**
     * 事件对象格式
     * @type {Object}
     *
     *  {
     *      'eventName' : [
     *          {
     *              'fn' : fn, //原函数
     *              'proxy': proxyfn, //处理过后的回调函数
     *              'i' : item.length, //eventName数组下对应的index位置
     *              'agent' : agent, //回调函数执行的上下文
     *              'type' : 'eventName' //事件名
     *              }
     *      ]
     *  }
     */
    var handlers = {}, _zid = 1,
        BEFORE_EVENT = 'before',
        AFTER_EVENT = 'after',
        CUSTOMEVENT = 'customEvents';
        
    //可以在外部访问到事件对象集合
    $.ceHandlers = handlers;

    function findHandlers(event, fn, agent) {
        return (handlers[event] || []).filter(function (handler) {
            return handler
                && (!fn || zid(handler.fn) === zid(fn))
                && (!agent || handler.agent == agent)
        })
    }

    function zid(element) {
        return element._zid || (element._zid = _zid++)
    }

    function reIndex(arr) {
        arr.forEach(function (e, index) {
            e.i = index;
        });
    }

    function wrapName(evt, agent){
        return agent.constructor.NAME ? agent.constructor.NAME + ':' +evt : evt;
    }

    /**
     * 队列系统，用于控制多个回调函数的执行
     * @flag 用于区分队列的形式
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
        bind:function (evt, callback, option, agent, flag/*只在内部使用*/) {
            agent || (agent = window);
            var o = {type:evt},
                item = handlers[evt] || (handlers[evt] = []),
                proxyfn = function (e, data) {
                    return callback.apply(agent, [e].concat(data));
                };
            if(!agent){

            }
            o = $.extend(o, {fn:callback, proxy:proxyfn, agent:agent});
            if (flag === BEFORE_EVENT) {
                item.unshift(o);
            } else{
                item.push(o);
            }
            reIndex(item);
            return o;
        },
        unbind:function (evt, callback, agent) {
            findHandlers(evt, callback, agent).forEach(function (handler) {
                delete handlers[evt][handler.i];
                reIndex(handlers[evt]);
            });
        },
        trigger:function (evt, data, agent) {
            var queue = $.Queue(CUSTOMEVENT);
            findHandlers(evt, undefined, agent).forEach(function (item) {
                var o = {};
                o.fn = item.proxy;
                o.event = item;
                if(data){
                    o.data = data;
                }
                o.option = item.option;
                queue.push(o);
            });
            queue.run();
        },
        after : function(evt, callback, option, agent){
            return $.bind(evt, callback, option, agent, AFTER_EVENT)
        },
        before : function(evt, callback, option, agent){
            return $.bind(evt, callback, option, agent, BEFORE_EVENT)
        },
        /**
         * 用于对对象增加自定义事件的支持
         */
        addCustomEvent:function () {
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

    });

})(Zepto);

/**
 * change log
 * @20120827 增加name的处理，如果在模块内进行事件绑定，会有模块的前缀
 */