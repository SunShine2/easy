/**
 * @author : youxiao@alibaba-inc.com
 * @version : 0-0-1
 * @require zepto.js/dialog.css
 * @module $.EasyDialog
 */
;(function(){
    /**
     * 浮层组件
     *
     *      var dialog = new $.EasyDialog({
     *          title: '删除确认',
     *          content: '你确认要删除吗？',
     *          buttons: {
     *              '确定': function(){},
     *              '取消': function(e,sender){
     *                  this.close
     *              }
     *          }
     *      }).open();
     *
     * @class $.EasyDialog
     * @param options
     *      @param {String|Node|HTMLElement} [options.content]
     *      @param {String} [options.title]
     *      @param {Object} [options.buttons]
     * @constructor
     */
    function Dialog(options){
        this.options = $.extend({
            title: '提示'
        }, options);

        this._init(this.options);
    }
    Dialog.prototype._init = function(options){
        var _this = this,
            $foot;
        var html =
        '<div class="easy-dialog" style="display: none;">\
            <div class="main">\
                <div class="head"><span class="title"></span><button class="close"></button></div> \
                <div class="body"></div> \
                <div class="foot"></div>\
            </div> \
        </div>';
        this.$el = $(html);
        this.el = this.$el[0];
        this.setTitle(options.title);
        this.setContent(options.content);
        $foot = this.$el.find('.foot');
        $.each(options.buttons, function(k, v){
            var $btn = $('<button>'+k+'</button>');
            $btn.bind('tap', function(e){
                e.preventDefault();
                v.apply(_this, [e, this]);
            });
            $foot.append($btn);
        });
        this.$el.delegate('.head .close', 'tap', function(e){
            e.preventDefault();
            _this.close();
        }).delegate('button', {
            touchstart: function(){
                $(this).addClass('active');
            },
            touchend: function(){
                $(this).removeClass('active');
            }
        });
        $('body').append(this.$el);
    };
    /**
     * @method setContent 设置内容
     * @param {String|Node|HTMLElement} content
     * @chainable
     */
    Dialog.prototype.setContent = function(content){
        var $content;
        if(content instanceof $ || content instanceof $.zepto.Z){
            $content = content;
        }else if(content.tagName){
            $content = $(content);
        }else{
            $content = $('<div>'+content+'</div>');
        }
        this.$el.find('.body').html($content);
        return this;
    };
    /**
     * @method setTitle 设置标题
     * @param {String} title 标题
     * @chainable
     */
    Dialog.prototype.setTitle = function(title){
        this.$el.find('.head .title').html(title);
        return this;
    };
    /**
     * @method open 显示
     * @chainable
     */
    Dialog.prototype.open = function(){
        this.$el.show();
        return this;
    };
    /**
     * @method close 关闭
     * @chainable
     */
    Dialog.prototype.close = function(){
        this.$el.hide();
        return this;
    };
    /**
     * @method dispose 销毁
     */
    Dialog.prototype.dispose = function(){
        this.$el.remove();
    };

    $.EasyDialog = Dialog;
})();