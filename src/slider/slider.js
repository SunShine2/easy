/**
 * @author: youxiao@alibaba-inc.com
 * @version: 0-0-1
 * @require zepto.js/mustache.js/slider.css
 * @modify butian.wth ---- 增加dispose方法
 */
(function(){
    /**
     * @param wrapper 容器
     * @param params.tpl 当存在该参数时，将使用mustache渲染，否则每一项默认使用img标签
     * @param params.data 包含图片地址的数组
     * @param params.useTimer 是否启用自动轮播，default：true
     * @param params.delay 自动轮播的间隔，default：5000
     * @param params.ease 滚动的缓动效果，default：ease
     * @param params.duration 滚动一次的时间，default：200
     * @param params.useTransform 使用transform还是left动画，default：true
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
        this.EASE = params.ease || 'ease';
        this.DURATION = params.duration?params.duration/1000+'s':'0.2s';
        this.USETRANSFORM = params.useTransform !== false;
        this.PROPERTY = this.USETRANSFORM?'-webkit-transform':'left';
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
                html_slider+='<img class="item" data-index="'+index+'" data-src="'+item+'"/>';
            }
            html_icon+='<i'+(index===0?' class="current"':'')+'></i>';
        });
        if(_this.TPL){
            html_slider = Mustache.to_html('{{#data}}<div class="item">'+_this.TPL+'</div>{{/data}}', {
                data: data
            });
        }
        slider.css('-webkit-transition', [this.PROPERTY, this.DURATION, this.EASE].join(' ')).html(html_slider);
        if(!this.USETRANSFORM){
            slider.css('position', 'relative');
        }
        icon.html(html_icon);
        this.wrapper.addClass('easy-slider').append(slider).append(icon);
        if(this.USEARROW){
            this.wrapper.append('<i class="prev"></i><i class="next"></i>');
        }
        this.slider = slider;
        this.icons = icon.find('i');
        this._scroll();
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

        this.wrapper.bind('swipeRight', handlePrev).bind('swipeLeft', handleNext);

        if(this.USEARROW){
            this.wrapper.delegate('.prev', 'tap', handlePrev).delegate('.next', 'tap', handleNext)
                .delegate('.prev,.next', 'touchstart', function(e){
                    $(this).addClass('hover');
                }).delegate('.prev,.next', 'touchend', function(){
                    $(this).removeClass('hover');
                });
        }

        if(this.USETIMER){
            this.wrapper.bind('touchstart', function(e){
                clearInterval(_this.timer);
            }).bind('touchend', function(){
                    _this._initTimer();
                });
        }
    };
    EasySlider.prototype._handleSrc = function(){
        var _this = this, cItem = this.wrapper.find('.item').eq(this.index);
        if(!cItem.data('ready')){
            var nodelist = [];
            if(cItem.data('src')){
                nodelist.push(cItem[0]);
            }
            cItem.find('[data-src]').each(function(index, item){
                nodelist.push(item);
            });
            nodelist.forEach(function(node){
                node.setAttribute('src', node.getAttribute('data-src'));
                node.removeAttribute('data-src');
            });
            cItem.data('ready', '1');
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
        this._handleSrc();
        this._handleDisable();

        var width = this.WIDTH?this.WIDTH:this.wrapper.width();
        if(this.USETRANSFORM){
            this.slider.css('-webkit-transform', 'translate3d(-' + width * this.index + 'px, 0, 0)');
        }else{
            this.slider.css('left', '-' + width * this.index + 'px');
        }
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