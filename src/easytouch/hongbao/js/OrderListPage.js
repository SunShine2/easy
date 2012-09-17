;(function(){
    var OrderList = $.EasyTouch.Model.extend({
        server: {
            url: 'http://taobao.windcache.com/market/order/list/',
            data: {
                type: 'withoutpay',
                perpage: 10,
                cloud_app_id: 1,
                sign: 'NzEyMGFkM2ViYzU0MGM0YzBkNDgxNGI0ODJiZDU4ZTc0YWI3NDAyMzp6aG91cWljZjo2MDExOTpkOWVhZTM0ZWE3ZWU1NDBmYmFkNTRjZjhhNDMzZjMwYjoxMzQ3NjExMTQ0'
            }
        },
        watch: {
            curpage: 'data curpage',
            hasnext: 'data hasnext',
            total: 'data total'
        },
        validate: function(data){
            return data.success;
        },
        parse: function(data){
            return data.data.list;
        }
    });

    window.OrderListPage = $.EasyTouch.Page.extend({
        html: 'html/OrderListPage.html',
        model: new OrderList,
        events: {
            'tap .et-load-more': 'getNext',
            'tap .et-tabs li': 'changeTab'
        },
        init: function(){
            var _this = this;

            this.iScroll = this.app.iScroll(this.el.querySelector('.et-iScroll'), {
                checkDOMChanges: true
            });

            this.model.bind('beforeSend', function(e, params){
                _this.showLoading({
                    msg: '数据加载中...',
                    modal: true
                });
            });
            this.model.bind('success', function(){
                console.log(arguments);
                _this.$el.find('.et-load-more').text('加载更多');
            });
            this.model.bind('error', function(){
                _this.$el.find('.et-load-more').text('再试一次');
            });
            this.model.bind('complete', function(){
                _this.hideLoading();
            });
            this.model.bind('dataerror', function(){
                console.log('数据错误');
                _this.$el.find('.et-load-more').text('再试一次');
            });
            this.model.bind('reset', function(){
                var total = _this.model.getAttr('total');
                _this.$el.find('.et-good-list').empty();
                _this.$el.find('#order-withoutpay').text('('+total.withoutpay+')')
                _this.$el.find('#order-withpay').text('('+total.withpay+')')
                _this.$el.find('#order-ok').text('('+total.all+')');

                _this.iScroll.refresh();
            });
            this.model.bind('change', function(e, params){
                var html = Mustache.to_html(_this.$el.find('script').html(), {
                    list: params.data
                });
                _this.$el.find('.et-good-list').append(html);

                if(!_this.model.getAttr('hasnext')){
                    _this.$el.find('.et-load-more').hide();
                }else{
                    _this.$el.find('.et-load-more').show();
                }
            });

            this.model.fetch();
        },
        getNext: function(){
            this.model.getNext({
                page: this.model.getAttr('curpage') + 1
            });
        },
        changeTab: function(e, sender){
            this.$el.find('.et-tabs .current').removeClass('current');
            $(sender).addClass('current');
            this.model.fetch({
                type: sender.getAttribute('data-type')
            });
        }
    });
})();