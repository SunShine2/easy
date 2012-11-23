;(function(){
    window.Page = $.EasyTouch.Page.extend({
        initializer: function(options){
            this.super.initializer.apply(this, arguments);

            this.bind('pagebeforeinit', function(){
                this.initAutos();
            });
        },
        autos: {},
        initAutos: function(){
            var _this = this;
            $.each(this.autos, function(action, params){
                switch(action){
                    case 'iScroll':
                        _this.initiScroll(params);
                        break;
                    case 'loading':
                        _this.initLoading(params);
                        break;
                    case 'loadMoreBtn':
                        _this.initLoadMoreBtn(params);
                        break;
                    default:
                        break;
                }
            });
        },
        initiScroll: function(params){
            var _this = this,
                iScrollWrap = this.el.querySelector(params.selector || '.et-iScroll'),
                model = params.model || this.model;
            this.iScroll = this.app.iScroll(iScrollWrap, {
                checkDOMChanges: true
            });
            model && model.bind('reset', function(){
                setTimeout(function(){
                    _this.iScroll.scrollTo(0,0,0);
                }, 100);
            });
        },
        initLoading: function(params){
            var _this = this,
                models = params.model || this.model;
            models = $.type(models) !== 'array'?[models]:models;
            models.forEach(function(model){
                model.bind('beforeSend', function(){
                    _this.showLoading({
                        msg: i18n.loadding,
                        modal: true
                    });
                });
                model.bind('complete', function(){
                    _this.hideLoading();
                });
            });
        },
        initLoadMoreBtn: function(params){
            var models = params.model || this.model;
            models = $.type(models) !== 'array'?[models]:models;
            var loadMoreBtn = this.$el.find(params.selector || '.et-load-more');
            models.forEach(function(model){
                model.bind('success', function(){
                    loadMoreBtn.text('加载更多');
                });
                model.bind('error', function(){
                    loadMoreBtn.text('再试一次');
                });
                model.bind('dataerror', function(){
                    loadMoreBtn.text('再试一次');
                });
                model.bind('change', function(){
                    if(!model.attrs.hasnext){
                        loadMoreBtn.hide();
                    }else{
                        loadMoreBtn.show();
                    }
                });
            });
        }
    });
})();