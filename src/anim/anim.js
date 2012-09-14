/**
 * 动画模块，对zepto的动画模块进行补充
 * version: 0.0.1
 * TODO:调用zepto fx中的method完成动画
 * TODO:增加slideup,slidedown等基本的动画函数，和jQuery的基本动画函数保持一致
 * TODO:解决同一个元素上绑定多个动画时的冲突问题
 */

(function ($) {
    /**
     * 用于存储生成anim对象的参数
     * @type {Object}
     */
    var NAME = 'Anim',
        //动画暂停的时候触发
        EVENT_PAUSE = 'pause',
        //动画继续的时候触发
        EVENT_RESUME = 'resume',
        //tween事件会在每一帧动画结束时触发
        EVENT_TWEEN = 'tween',
        RUNNING = 'running',
        START_TIME = 'startTime',
        ELAPSED_TIME = 'elapsedTime',
        START = 'start',
        END = 'end',
        NODE = 'node',
        PAUSED = 'paused',
        STRING = 'string',
        NODE_ERROR = '[Anim error] ：node is required when initializing $.Anim',
        _timer,
        _running = {};

    $.Anim = function () {
        $.Anim.superclass.constructor.apply(this, arguments);
        $.Anim._instances[$.zid(this)] = this;
    };

    $.Anim._instances = {};
    $.Anim.NAME = NAME;
    /**
     * 静态参数的处理
     * @type {*}
     */
    /**
     * 默认的单位
     * @type {String}
     */
    $.Anim.DEFAULT_UNIT = 'px';
    /**
     * 使用到默认单位的css属性
     * @type {RegExp}
     */
    $.Anim.RE_DEFAULT_UNIT = /^width|height|top|right|bottom|left|margin.*|padding.*|border.*$/i;
    /**
     * 每一帧动画的默认间隔时间，单位是毫秒
     * @type {Number}
     * @private
     */
    $.Anim._intervalTime = 20;
    /**
     * 默认的easing
     * @type {String}
     */
    $.Anim.DEFAULT_EASING = 'linear';

    /**
     * ATTRS属性的处理
     * @type {Object}
     */
    $.Anim.ATTRS = {
        /**
         * 动画所在的节点
         */
        node:{
            setter:function () {
                if (node) {
                    if (typeof node == STRING || node.nodeType) {
                        node = $(node);
                    }
                }

                this._node = node;
                if (!node) {
                    throw new Error(NODE_ERROR);
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
            value:$.Anim.DEFAULT_EASING,
            setter:function (val) {
                if (typeof val === STRING && $.Anim.Easing) {
                    return $.Anim.Easing[val];
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
     * 动画模块含有的静态方法
     * @type {*}
     */

    /**
     * 启动动画
     */
    $.Anim.run = function () {
        var instances = $.Anim._instances;
        $.each(instances, function (key, item) {
            if (instances[item].run) {
                instances[item].run()
            }
        })
    };
    /**
     * 暂停动画
     */
    $.Anim.pause = function () {
        $.each(_running, function (key, item) {
            if (_running[item].pause) {
                _running[item].pause();
            }
        });

        $.Anim._stopTimer();
    };
    /**
     * 停止动画
     */
    $.Anim.stop = function () {
        $.each(_running, function (key, item) {
            if (_running[item].stop) {
                _running[item].stop();
            }
        });
        $.Anim._stopTimer();
    };

    $.Anim._startTimer = function () {
        if (!_timer) {
            _timer = setInterval($.Anim._runFrame, $.Anim._intervalTime);
        }
    };

    $.Anim._stopTimer = function () {
        clearInterval(_timer);
        _timer = 0;
    };

    $.Anim._runFrame = function () {
        var done = true;
        $.each(_running, function (key, item) {
            if (_running[item]._runFrame) {
                done = false;
                _running[item]._runFrame();
            }
        });

        if (done) {
            $.Anim._stopTimer();
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
        stop:function () {
            if (this.get(RUNNING) || this.get(PAUSED)) {
                this._end();
            }
            return this;
        },
        _added:false,

        _start:function () {
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            this._actualFrames = 0;

            _running[$.zid(this)] = this;
            $.Anim._startTimer();

            this.fire(START);
        },

        _pause:function () {
            this._set(START_TIME, null);
            this._set(PAUSED, true);
            delete _running[$.zid(this)];

            this.fire(EVENT_PAUSE);
        },

        _resume:function () {
            this._set(PAUSED, false);
            _running[$.zid(this)] = this;
            this._set(START_TIME, new Date() - this.get(ELAPSED_TIME));
            $.Anim._startTimer();

            this.fire(EVENT_RESUME);
        },

        _end:function () {
            var duration = this.get('duration') * 1000;

            this._set(START_TIME, null);
            this._set(ELAPSED_TIME, 0);
            this._set(PAUSED, false);

            delete _running[$.zid(this)];
            this.fire(END, {elapsed:this.get(ELAPSED_TIME)});
        },

        _runFrame:function () {
            var t = new Date() - this.get(START_TIME);

            this._actualFrames = this._actualFrames + 1;
            this._set(ELAPSED_TIME, t);

            this.fire(EVENT_TWEEN);
        },

        destructor:function () {
            delete $.Anim._instances[$.zid(this)];
        }
    };

    /**
     * 使用Base的connect方法生成动画模块
     */

    $.Base.connect($.Anim, $.Base, proto);

})(Zepto);