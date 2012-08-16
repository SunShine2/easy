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
    var handlers = {}, _zid = 1;
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

    $.extend($, {
        'subscribe':function (evt, callback, agent) {
            var o = {'type':evt},
                item = handlers[evt] || (handlers[evt] = []),
                proxyfn = function () {
                    return callback.apply(agent, arguments);
                };
            o = $.extend(o, {'fn':callback, 'proxy':proxyfn, 'i':item.length, 'agent':agent});
            item.push(o);
            return o;
        },
        'unSubscribe':function (evt, callback, agent) {
            findHandlers(evt, callback, agent).forEach(function (handler) {
                delete handlers[evt][handler.i]
            });
        },
        'publish':function (evt, data, agent) {
            findHandlers(evt, undefined, agent).forEach(function (ret) {
                data && $.extend(ret, data);
                ret['proxy'](ret);
            });
        }
    });

})(Zepto);