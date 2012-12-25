/**
 * @author: youxiao@alibaba-inc.com
 * @version: 0-0-1
 * @require zepto.js/mustache.js/slider.css
 */
(function(){
    /**
     * @param wrapper 容器
     * @param params.tpl 当存在该参数时，将使用mustache渲染，否则每一项默认使用img标签
     * @param params.data 包含图片地址的数组
     * @param params.useTimer 是否启用自动轮播，default：true
     * @param params.delay 自动轮播的间隔，default：5000
     * @param params.onchange 切换到某一张图片的时间回调，arguments: index
     */
    function EasySlider(wrapper, params){
        this.wrapper = typeof wrapper === 'string'?$(wrapper):wrapper;
        this.params = params;
        this.index = 0;
        this.length = params.data.length;

        this.TPL = params.tpl;
        this.USETIMER = params.useTimer !== false;
        this.USEARROW = params.useArrow !== false;
        this.DELAY = params.delay || 5000;
        this.WIDTH = params.width || this.wrapper.width();

        this._renderUI(params.data);
        this._bindUI();
        this._initTimer();
    }
    EasySlider.prototype._renderUI = function(data){
        var slider = $('<div class="sliders"></div>'),
            icon = $('<div class="icons"></div>'),
            html_slider = '',
            html_icon = '',
            _this = this;
        data.forEach(function(item, index){
            if(!_this.TPL){
                html_slider+='<img class="item" src="'+item+'"/>';
            }
            html_icon+='<i'+(index===0?' class="current"':'')+'></i>';
        });
        if(_this.TPL){
            html_slider = Mustache.to_html('{{#data}}<div class="item">'+_this.TPL+'</div>{{/data}}', {
                data: data
            });
        }
        slider.html(html_slider).find('.item').each(function(index, item){
            if(index === 0){
                $(item).addClass('current');
            }else{
                $(item).addClass('right');
            }
        });
        icon.html(html_icon);
        this.wrapper.addClass('easy-slider').append(slider).append(icon);
        if(this.USEARROW){
            this.wrapper.append('<i class="prev"></i><i class="next"></i>');
        }
        this.slider = slider;
        this.icons = icon.find('i');
        this._handleDisable();
    };
    EasySlider.prototype._initTimer = function(){
        if(!this.USETIMER || this.length === 1){
            return;
        }
        var _this = this;
        this.timer = setInterval(function(){
            _this.index = _this.index === _this.length - 1?0:++_this.index;
            _this._scroll();
        }, this.DELAY);
    };
    EasySlider.prototype._stopTimer = function(){
        this.timer && clearInterval(this.timer);
    };
    EasySlider.prototype._bindUI = function(){
        var _this = this,
            handlePrev = function(){
                if(_this.index > 0){
                    _this.index--;
                    _this._scroll();
                }
            },
            handleNext = function(){
                if(_this.index < _this.length - 1){
                    _this.index++;
                    _this._scroll();
                }
            };

        //this.wrapper.bind('swipeRight', handlePrev).bind('swipeLeft', handleNext);

        if(this.USEARROW){
            this.wrapper.delegate('.prev', 'click', handlePrev).delegate('.next', 'click', handleNext);
        }

        if(this.USETIMER){
            this.wrapper.bind('mouseover', function(e){
                clearInterval(_this.timer);
            }).bind('mouseout', function(){
                _this._initTimer();
            });
        }
    };
    EasySlider.prototype._handleDisable = function(){
        var $prev = this.wrapper.find('.prev'),
            $next = this.wrapper.find('.next');

        if(this.index === 0 && this.length > 1){
            $prev.addClass('disabled');
            $next.removeClass('disabled');
        }else if(this.index === this.length - 1 && this.length > 1){
            $next.addClass('disabled');
            $prev.removeClass('disabled');
        }else if(this.length === 1){
            $prev.addClass('disabled');
            $next.addClass('disabled');
        }else{
            $prev.removeClass('disabled');
            $next.removeClass('disabled');
        }
    };
    EasySlider.prototype._scroll = function(){
        this._handleDisable();

        var items = this.wrapper.find('.item');
        items.eq([this.index - 1]).removeClass('current').addClass('left');
        items.eq([this.index + 1]).removeClass('current').addClass('right');
        items.eq([this.index]).removeClass('left').removeClass('right').addClass('current');

        var width = this.WIDTH?this.WIDTH:this.wrapper.width();
        this.slider.css('left', '-' + width * this.index + 'px');
        this.icons.removeClass('current').eq(this.index).addClass('current');

        this.params.onchange && this.params.onchange.apply(this, [this.index]);
    };
    /**
     * @method reset 重置图片
     * @param data
     */
    EasySlider.prototype.reset = function(data){
        this._stopTimer();
        this.index = 0;
        this.length = data.length;
        this.wrapper.empty();
        this._renderUI(data);
        this._initTimer();
    };
    /**
     * @method dispose 销毁组件
     */
    EasySlider.prototype.dispose = function(){
        this.wrapper.unbind();
        this._stopTimer();
        this.wrapper.empty();
    };

    $.EasySlider = EasySlider;
})();