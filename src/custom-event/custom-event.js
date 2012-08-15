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
                proxyfn = function (event, data) {
                    return callback.apply(agent, [event].concat(data));
                };
            o = $.extend(o, {'fn':callback, 'proxy':proxyfn, 'i':item.length, 'agent':agent});
            item.push(o);
        },
        'unSubscribe':function (evt, callback, agent) {
            $.each(findHandlers(evt, callback, agent), function (handler) {
                delete handlers[evt][handler.i]
            });
        },
        'publish':function (evt, data, agent) {
            $.each(findHandlers(evt, undefined, agent), function (key, ret) {
                evt = ret;
                ret['proxy'](evt, data);
            })
        }
    });

})(Zepto);