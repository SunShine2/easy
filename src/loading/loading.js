/**
 * loading模块处理
 * version : 0.0.1
 * author : butian.wth@aliyun.com
 *
 * 使用方法$.loading.hide()/show()
 */

(function ($) {

    var DEF_LOADING = '&nbsp;&nbsp;加载中...',
        NETWORK_ERROR = '网络繁忙，请检查网络或重试。';

    var Loading = $.Base.build('Loading', {
            initializer:function () {
                this.initCont();
            },
            initCont : function(){
                var div = $('<div></div>');
                div[0].style.cssText = 'width:100%;height:100%;background-color:rgba(255,255,255,0);position:absolute;left:0;top:0;z-index:10000;text-align:center;';
                div.html('<div style="position:relative;top:50%;margin:-57px auto 0;min-width:32px;padding:70px 15px 15px;font-size:16px;border:1px solid #ddd;border-radius:6px;display:inline-block;-webkit-box-shadow:0px 0px 6px #ddd;opacity:0.9;background:#fff url(data:image/gif;base64,R0lGODlhMAAwAKIGAP39/djY2AEBAYiIiEpKSrGxsfr6+gAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkRBMUJDOTQyRUYyMTFFMTg4RDhDMjdDRjI1QTJFNEIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkRBMUJDOTUyRUYyMTFFMTg4RDhDMjdDRjI1QTJFNEIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxQkE5OTcxMTJFRDAxMUUxODhEOEMyN0NGMjVBMkU0QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxQkE5OTcxMjJFRDAxMUUxODhEOEMyN0NGMjVBMkU0QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDP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) no-repeat center 20px;">' + this.tipMsg + '</div>');
                $('body').append(div);
                div.hide();
                this.wrapper = $(div);
            },
            checkTimeout:function(){
                var startTime = new Date(),
                    that =this;
                if (this.timeout && this.callback) {
                    clearInterval(this.interval);
                    this.interval = setInterval(function () {
                        var time = new Date() - startTime;
                        if (time > that.timeout && that.wrapper.hide()) {
                            clearInterval(that.interval);
                            that.interval = null;
                            that.hide();
                            that.callback();
                        }
                    }, 1000);
                }
            },
            show : function(){
                this.wrapper.show();
                //检测超时
                this.checkTimeout()
            },
            hide : function(){
                var that = this;
                setTimeout(function () {
                    that.wrapper.hide();
                    clearInterval(that.interval);
                }, 100)
            },
            destructor:function () {

            }
        },
        {
            timeout:{
                value:15000,
                validator:/\d+/
            },
            tipMsg:{
                value:DEF_LOADING,
                validator:/.+/
            },
            container:{
                value:'#hb_loading',
                validator:/.+/
            },
            callback :{
                value : function () {
                    __runtime__.getActiveApp().showMsgBox("提示", NETWORK_ERROR);
                },
                setter : function(value){
                    return (typeof value === 'function')
                }
            }
        },
        {

        }
    );

    $.loading = new Loading();

})(Zepto);