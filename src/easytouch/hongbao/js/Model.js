;(function(){
    var root = 'http://app.windcache.com/';

    var property = {
        init: function(){
            var _this = this;
            this.bind('dataerror', function(e, data){
                //没有绑定淘宝帐号
                if(data.code === 902){
                    app.bindTaobao(function(){
                        _this.callback();
                    });
                //sign验证失败
                }else if(data.code === 900){
                    app.getSign(function(){
                        _this.callback();
                    });
                }
                navigator.notification.toast((data && data.msg)?data.msg:i18n.net_error);
            });
            this.bind('error', function(){
                navigator.notification.toast(i18n.net_error);
            });
        },
        parseAjaxOptions: function(options){
            options.url = root + options.url;
            options.data = options.data || {};
            options.data.sign = app.model.get('sign');
            options.data.cloud_app_id = app.model.get('cloud_app_id') || 101;
            options.data.nocache = new Date().getTime();
            return options;
        },
        validate: function(data){
            return data.code === 200 || data.success;
        },
        ajax: function(options, settings){
            var _this = this, argus = arguments;
            this.callback = function(){
                _this.super.ajax.apply(_this, argus);
            };
            app.checkNet(function(){
                app.getSign(function(){
                    _this.super.ajax.apply(_this, argus);
                });
            });
        }
    };

    window.Model = $.EasyTouch.Model.extend(property);
    window.ModelList = $.EasyTouch.ModelList.extend(property);
})();