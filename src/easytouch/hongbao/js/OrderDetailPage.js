;(function(){
    var OrderDetail = window.Model.extend({
        server: {
            url: '',
            data: {
                method: 'center.order.detail'
            }
        },
        parse: function(data){
            data = data.data;
            data.status_untake = data.order.status === '4';
            data.status_unpay = data.order.status === '0';
            return data;
        }
    });

    window.OrderDetailPage = window.Page.extend({
        html: 'html/OrderDetailPage.html',
        model: new OrderDetail,
        autos: {
            loadMoreBtn: {},
            loading: {},
            iScroll: {}
        },
        events: {
            '#order-logistics': {
                tap: 'logistics'
            },
            '#order-complete': {
                tap: 'complete'
            },
            '#order-payment': {
                tap: 'pay'
            }
        },
        init: function(data){
            var _this = this;

            this.iScroll = this.app.iScroll(this.el.querySelector('.et-iScroll'), {
                checkDOMChanges: true
            });

            var tpl = _this.$el.find('script').html(),
                map = {
                    '0': '等待付款的订单',
                    '1': '等待发货的订单',
                    '2': '已关闭的订单',
                    '3': '成功的订单',
                    '4': '等待确认收货的订单',
                    '5': '已付款的订单',
                    '9': '已废弃的订单'
                };
            this.model.bind('reset', function(e, model){
                var $title = _this.$el.find('h1'),
                    status = model.order.status;
                $title.text(map[status]?map[status]:'订单详情');
                _this.$el.find('.scroller').html(Mustache.to_html(tpl, model));
            });
        },
        ready: function(data){
            if(!data){
                return;
            }
            this.model.fetch({
                data: $.extend(this.model.server.data, data)
            });
        },
        pay: function(){
            this.app.pay($.extend({
                token: '8f417536ba8912d201188f27e83db1b8'
            }, this.model.get('order')));
        },
        logistics: function(){
            var _this = this;
            if(!this.dialog){
                var buttons = {};
                buttons[i18n.dialog_ok] = function(){
                    this.close();
                };
                this.dialog = new $.EasyDialog({
                    title: i18n.order_logistics_title,
                    buttons: buttons
                });
            }
            this.model.ajax({
                url: '',
                data: {
                    method: 'center.order.logistics',
                    out_trade_no: this.model.get('order.trade_no')
                }
            }, {
                success: function(data){
                    //TODO
                    _this.dialog.setContent(data.content);
                    _this.dialog.open();
                }
            });
        }
    });
})();