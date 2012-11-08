;(function(){
    var OrderList = window.Model.extend({
        server: {
            url: 'center/order/list/',
            data: {
                type: 'unpay',
                perpage: 10
            }
        },
        watch: {
            curpage: 'data curpage',
            hasnext: 'data hasnext',
            total: 'data total'
        },
        parse: function(data){
            return data.data.list;
        }
    });

    window.OrderListPage = window.Page.extend({
        html: 'html/OrderListPage.html',
        model: new OrderList,
        events: {
            '.et-load-more': {
                tap: 'getNext'
            },
            '.et-tabs li': {
                tap: 'changeTab'
            }
        },
        init: function(){
            var _this = this;

            this.model.bind('reset', function(){
                var total = this.attrs.total;
                _this.$el.find('.order-list').empty();
//                _this.$el.find('#order-unpay').text('('+total.withoutpay+')')
//                _this.$el.find('#order-untake').text('('+total.withpay+')')
//                _this.$el.find('#order-success').text('('+total.all+')');
            });
            var tpl = _this.$el.find('script').html();
            this.model.bind('add', function(e, params){
                var html = Mustache.to_html(tpl, {
                    list: params.data
                });
                _this.$el.find('.order-list').append(html);
            });

            this.model.fetch();
        },
        getNext: function(){
            this.model.getNext({
                page: this.model.attrs.curpage + 1
            });
        },
        changeTab: function(e, sender){
            this.$el.find('.et-tabs .current').removeClass('current');
            $(sender).addClass('current');
            this.model.fetch({
                page: 1,
                type: sender.getAttribute('data-type')
            });
        }
    });
})();