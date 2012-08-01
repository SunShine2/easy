//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function($){
  var touch = {},
    touchTimeout, tapTimeout, swipeTimeout,
    longTapDelay = 750, longTapTimeout

  /**
   * 如果是文本节点则获取其父节点
   * @param node
   */
  function parentIfText(node) {
    return 'tagName' in node ? node : node.parentNode
  }

  /**
   * 判断方向
   * @param x1
   * @param x2
   * @param y1
   * @param y2
   */
  function swipeDirection(x1, x2, y1, y2) {
    var xDelta = Math.abs(x1 - x2), yDelta = Math.abs(y1 - y2)
    return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
  }

  /**
   * 触发longTap事件
   */
  function longTap() {
    longTapTimeout = null
    if (touch.last) {
      touch.el.trigger('longTap')
      touch = {}
    }
  }

  /**
   * 取消longTap事件
   */
  function cancelLongTap() {
    if (longTapTimeout) clearTimeout(longTapTimeout)
    longTapTimeout = null
  }

  /**
   * 撤销所有事件
   */
  function cancelAll() {
    if (touchTimeout) clearTimeout(touchTimeout)
    if (tapTimeout) clearTimeout(tapTimeout)
    if (swipeTimeout) clearTimeout(swipeTimeout)
    if (longTapTimeout) clearTimeout(longTapTimeout)
    touchTimeout = tapTimeout = swipeTimeout = longTapTimeout = null
    touch = {}
  }

  $(document).ready(function(){
    var now, delta

    //在document.body出做代理
    $(document.body)
      .bind('touchstart', function(e){
        now = Date.now()
        delta = now - (touch.last || now)
        touch.el = $(parentIfText(e.touches[0].target)) //获取触摸起始所在元素
        touchTimeout && clearTimeout(touchTimeout) //如果已经存在touch计时器则clear掉
        touch.x1 = e.touches[0].pageX //获取触摸所在的位置x,y
        touch.y1 = e.touches[0].pageY
        if (delta > 0 && delta <= 250) touch.isDoubleTap = true //如果两次tap间隔时间在250ms内则判断为双击
        touch.last = now
        longTapTimeout = setTimeout(longTap, longTapDelay)
      })
      .bind('touchmove', function(e){
        cancelLongTap() //如果移动了，则取消longTap事件
        touch.x2 = e.touches[0].pageX
        touch.y2 = e.touches[0].pageY
      })
      .bind('touchend', function(e){
         cancelLongTap() //触摸结束清除longTap判断

        // 移动距离大于30px则判断为有效的touch
        if ((touch.x2 && Math.abs(touch.x1 - touch.x2) > 30) ||
            (touch.y2 && Math.abs(touch.y1 - touch.y2) > 30))

          swipeTimeout = setTimeout(function() {
            touch.el.trigger('swipe')
            touch.el.trigger('swipe' + (swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2)))
            touch = {}
          }, 0)

        // 只是普通的tap
        else if ('last' in touch)

          // delay by one tick so we can cancel the 'tap' event if 'scroll' fires
          // 做一次延迟，从而可以做到如果scroll事件触发的时候，取消tap事件
          // ('tap' fires before 'scroll')
          // tap只能在scroll之前触发
          tapTimeout = setTimeout(function() {

            // trigger universal 'tap' with the option to cancelTouch()
            // (cancelTouch cancels processing of single vs double taps for faster 'tap' response)
            var event = $.Event('tap')
            event.cancelTouch = cancelAll
            touch.el.trigger(event)

            // trigger double tap immediately
            if (touch.isDoubleTap) {
              touch.el.trigger('doubleTap')
              touch = {}
            }

            // trigger single tap after 250ms of inactivity
            else {
              touchTimeout = setTimeout(function(){
                touchTimeout = null
                touch.el.trigger('singleTap')
                touch = {}
              }, 250)
            }

          }, 0)

      })
      .bind('touchcancel', cancelAll)

    $(window).bind('scroll', cancelAll)
  })

  ;['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'doubleTap', 'tap', 'singleTap', 'longTap'].forEach(function(m){
    $.fn[m] = function(callback){ return this.bind(m, callback) }
  })
})(Zepto)
