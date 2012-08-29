/**
 * 动画模块，对zepto的动画模块进行补充
 * version: 0-0-1
 */

(function ($) {
    /**
     * 用于存储生成anim对象的参数
     * @type {Object}
     */
    var animation = {},
        RUNNING = 'running',
        START_TIME = 'startTime',
        ELAPSED_TIME = 'elapsedTime',
        START = 'start',
        END = 'end',
        NODE = 'node',
        PAUSED = 'paused';

    /**
     * 静态参数的处理
     * @type {*}
     */
    /**
     * 默认的单位
     * @type {String}
     */
    animation.DEFAULT_UNIT = 'px';
    /**
     * 使用到默认单位的css属性
     * @type {RegExp}
     */
    animation.RE_DEFAULT_UNIT = /^width|height|top|right|bottom|left|margin.*|padding.*|border.*$/i;
    /**
     * 每一帧动画的默认间隔时间，单位是毫秒
     * @type {Number}
     * @private
     */
    animation._intervalTime = 20;
    /**
     * 默认的easing
     * @type {String}
     */
    animation.DEFAULT_EASING = 'linear';
    /**
     * 动画的执行队列
     * @type {Object}
     */
    animation._running = {};
    /**
     * ATTRS属性的处理
     * @type {Object}
     */
    animation.ATTRS = {
        /**
         * 动画所在的节点
         */
        node:{
            setter:function () {
                if (node) {
                    if (typeof node == 'string' || node.nodeType) {
                        node = $(node);
                    }
                }

                this._node = node;
                if (!node) {
                    throw new Error('[Anim error] ：node is required when initializing $.Anim');
                }
                return node;
            }
        },
        /**
         * 动画默认的持续时间，默认1s
         */
        duration:{
            value:1
        },
        /**
         * 动画的平滑效果，主要与浏览器对ease的支持有关
         */
        easing:{
            value:animation.DEFAULT_EASING,
            setter:function (val) {
                if (typeof val === 'string' && animation.Easing) {
                    return animation.Easing[val];
                }
            }
        },
        from:{},
        to:{},
        /**
         * 在当前的多久之后开始执行动画
         */
        startTime:{
            value:0,
            readOnly:true
        },
        /**
         * 当前动画已经运行的时间
         */
        elapsedTime:{
            value:0,
            readOnly:true
        },
        /**
         * 用于判断当前的时候是否正在运行
         */
        running:{
            value:false,
            readOnly:true
        },
        /**
         * 动画的重复次数
         */
        iterations:{
            value:1
        },
        /**
         * 动画当前运行到第几次
         */
        iterationCount:{
            value:0,
            readOnly:true
        },
        /**
         * 判断当前的动画是否处于暂停状态
         */
        paused:{
            readOnly:true,
            value:false
        }
    };

    /**
     * 动画模块含有的方法
     * @type {*}
     */

    /**
     * 启动动画
     */
    animation.run = function () {
        var instances = animation._instances;
        for (var i in instances) {
            if (instances[i].run) {
                instances[i].run();
            }
        }
    };
    /**
     * 暂停动画
     */
    animation.pause = function () {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].pause) {
                _running[i].pause();
            }
        }

        animation._stopTimer();
    };
    /**
     * 停止动画
     */
    animation.stop = function () {
        for (var i in _running) { // stop timer if nothing running
            if (_running[i].stop) {
                _running[i].stop();
            }
        }
        animation._stopTimer();
    };

    animation._startTimer = function () {
        if (!_timer) {
            _timer = setInterval(animation._runFrame, animation._intervalTime);
        }
    };

    animation._stopTimer = function () {
        clearInterval(_timer);
        _timer = 0;
    };

    animation._runFrame = function () {
        var done = true;
        for (var anim in _running) {
            if (_running[anim]._runFrame) {
                done = false;
                _running[anim]._runFrame();
            }
        }

        if (done) {
            animation._stopTimer();
        }
    };
    /**
     * 对外开放的方法
     * @type {Object}
     */
    var proto = {
        run:function () {
            if (this.get(PAUSED)) {
                this._resume();
            } else if (!this.get(RUNNING)) {
                this._start();
            }
            return this;
        },
        pause:function () {
            if (this.get(RUNNING)) {
                this._pause();
            }
            return this;
        },
        stop:function (finish) {
            if (this.get(RUNNING) || this.get(PAUSED)) {
                this._end(finish);
            }
            return this;
        },
        _added:false,

        _start:function () {
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            this._actualFrames = 0;
            if (!this.get(PAUSED)) {
                this._initAnimAttr();
            }
            _running[] = this;
            animation._startTimer();

            this.fire(START);
        },

        _pause:function () {
            this._set(START_TIME, null);
            this._set(PAUSED, true);
            delete _running[];

            /**
             * @event pause
             * @description fires when an animation is paused.
             * @param {Event} ev The pause event.
             * @type Event.Custom
             */
            this.fire('pause');
        },

        _resume:function () {
            this._set(PAUSED, false);
            _running[] = this;
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            animation._startTimer();

            /**
             * @event resume
             * @description fires when an animation is resumed (run from pause).
             * @param {Event} ev The pause event.
             * @type Event.Custom
             */
            this.fire('resume');
        },

        _end:function (finish) {
            var duration = this.get('duration') * 1000;
            if (finish) { // jump to last frame
                this._runAttrs(duration, duration, this.get(REVERSE));
            }

            this._set(START_TIME, null);
            this._set(ELAPSED_TIME, 0);
            this._set(PAUSED, false);

            delete _running[];
            this.fire(END, {elapsed:this.get(ELAPSED_TIME)});
        },

        _runFrame:function () {
            var d = this._runtimeAttr.duration,
                t = new Date() - this.get(START_TIME),
                reverse = this.get(REVERSE),
                done = (t >= d),
                attribute,
                setter;

            this._runAttrs(t, d, reverse);
            this._actualFrames += 1;
            this._set(ELAPSED_TIME, t);

            this.fire(TWEEN);
            if (done) {
                this._lastFrame();
            }
        },

        destructor:function () {
            delete animation._instances[];
        }
    };

    /**
     * 使用Base的build方法生成动画模块
     */

    $.Anim = $.Base.build('anim', proto, animation.ATTRS, {});

})(Zepto);