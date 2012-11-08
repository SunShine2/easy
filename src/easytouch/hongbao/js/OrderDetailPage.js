;(function(){
    var OrderDetail = window.Model.extend({
        server: {
            url: 'center/order/detail/',
            data: {}
        },
        parse: function(data){
            data = data.data;
            data.status_untake = data.order.status === '4';
            data.status_unpay = data.order.status === '0';
            return data;
        }
    });

    window.OrderDetailPage = $.EasyTouch.Page.extend({
        html: 'html/OrderDetailPage.html',
        model: new OrderDetail,
        events: {
            'order-logistics': {
                tap: function(){

                }
            },
            'order-complete': {
                tap: function(){

                }
            },
            'order-payment': {
                tap: function(){

                }
            }
        },
        init: function(data){
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
            this.model.bind('error', function(){
                //TODO
                _this.app.pageBack();
            });
            this.model.bind('complete', function(){
                _this.hideLoading();
            });
            this.model.bind('dataerror', function(){
                //TODO
                console.log('数据错误');
            });
            var tpl = _this.$el.find('script').html();
            this.model.bind('reset', function(e, params){
                var $title = _this.$el.find('h1'),
                    status = params.data.order.status;
                switch(status){
                    case '0':
                        $title.text('等待付款的订单');
                        break;
                    case '1':
                        $title.text('等待发货的订单');
                        break;
                    case '2':
                        $title.text('已关闭的订单');
                        break;
                    case '3':
                        $title.text('成功的订单');
                        break;
                    case '4':
                        $title.text('等待确认收货的订单');
                        break;
                    case '5':
                        $title.text('已付款的订单');
                        break;
                    case '9':
                        $title.text('已废弃的订单');
                        break;
                    default:
                        $title.text('订单详情');
                }
                _this.$el.find('.scroller').html(Mustache.to_html(tpl, params.data));
                _this.iScroll.refresh();
            });

            this.reset(data);
        },
        reset: function(data){
            if(!data){
                return;
            }
            this.model.fetch(data);
        }
    });
})();