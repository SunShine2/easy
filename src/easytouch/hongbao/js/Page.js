;(function(){
    window.Page = $.EasyTouch.Page.extend({
        initializer: function(){
            this._super = this.__proto__.__proto__.__proto__;
            this._super.initializer.apply(this, arguments);

            var _this = this;
            this.bind('pageinit', function(){
                if(_this.model){
                    _this.model.bind('beforeSend', function(e, params){
                        _this.showLoading({
                            msg: '数据加载中...',
                            modal: true
                        });
                    });
                    _this.model.bind('complete', function(){
                        _this.hideLoading();
                    });
                }

                var iScrollWrap = _this.el.querySelector('.et-iScroll');
                if(iScrollWrap){
                    _this.iScroll = _this.app.iScroll(iScrollWrap, {
                        checkDOMChanges: true
                    });
                }
                if(_this.model && iScrollWrap){
                    _this.model.bind('reset', function(){
                        _this.iScroll.refresh();
                    });
                }

                var loadMoreBtn = _this.$el.find('.et-load-more');
                if(loadMoreBtn){
                    _this.model.bind('success', function(){
                        console.log(arguments);
                        loadMoreBtn.text('加载更多');
                    });
                    _this.model.bind('error', function(){
                        loadMoreBtn.text('再试一次');
                    });
                    _this.model.bind('dataerror', function(){
                        loadMoreBtn.text('再试一次');
                    });
                    _this.model.bind('change', function(){
                        if(!_this.model.attrs.hasnext){
                            loadMoreBtn.hide();
                        }else{
                            loadMoreBtn.show();
                        }
                    });
                }
            });
        }
    });
})();