;(function(){
    var OrderList = window.ModelList.extend({
        server: {
            url: 'center/order/list/',
            data: {
                type: 'unpay',
                perpage: 10
            }
        },
        watch: {
            curpage: 'data.curpage',
            hasnext: 'data.hasnext',
            total: 'data.total'
        },
        parse: function(data){
            return data.data.list;
        }
    });

    window.OrderListPage = window.Page.extend({
        html: 'html/OrderListPage.html',
        model: new OrderList,
        autos: {
            loadMoreBtn: {},
            loading: {},
            iScroll: {}
        },
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

            this.model.bind('reset', function(e, models){
                _this.renderOrder(models, true);

                var total = this.attrs.total;
//                _this.$el.find('#order-unpay').text('('+total.withoutpay+')')
//                _this.$el.find('#order-untake').text('('+total.withpay+')')
//                _this.$el.find('#order-success').text('('+total.all+')');
            });

            this.model.bind('add', function(e, models){
                _this.renderOrder(models);
            });

            this.model.fetch();
        },
        renderOrder: function(models, fromReset){
            var tpl = this.$el.find('script').html(),
                html = Mustache.to_html(tpl, {
                    list: this.model.toJSON(models)
                }),
                $list = this.$el.find('.order-list');
            if(fromReset){
                $list.html(html);
            }else{
                $list.append(html);
            }
        },
        getNext: function(){
            this.model.next({
                data: $.extend(this.model.server.data, {
                    page: this.model.attrs.curpage + 1
                })
            });
        },
        changeTab: function(e, sender){
            this.$el.find('.et-tabs .current').removeClass('current');
            $(sender).addClass('current');
            this.model.server.data.type = sender.getAttribute('data-type');
            this.model.server.data.page = 1;
            this.model.fetch();
        }
    });
})();