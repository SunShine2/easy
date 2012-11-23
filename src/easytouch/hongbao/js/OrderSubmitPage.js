;(function(){
    var Order = window.Model.extend({
        server: {
            url: '',
            data: {
                method: 'center.order.confirm'
            }
        },
        parse: function(data){
            return data.data;
        }
    });
    /**
     * 订单确认页
     *
     *      app.navApp('hongbao', {
     *          cloud_app_id: 101,
     *          page: {
     *              id: 'OrderSubmitPage',
     *              data: {
     *                  num_iid: xxx,
     *                  sku: xxx,
     *                  num: 2
     *              }
     *          }
     *      })
     *
     * @class OrderSubmitPage
     * @param {Object} data
     * @param {String} [data.ordert_type] 默认Taobao
     * @param {String} data.sku SKU ID，如果商品有SKU，必须选择SKU
     * @param {String} [data.num_iid] 淘宝商品ID
     * @param {Number} [data.num] 购买数量 默认为1 可选
     * @param {String} [data.addressid] 收货地址ID，如果不填，则走默认收货地址ID
     */
    window.OrderSubmitPage = window.Page.extend({
        html: 'html/OrderSubmitPage.html',
        model: new Order,
        events: {
            '.et-check': {
                tap: 'checkbox'
            },
            '#submit-order': {
                tap: 'complete'
            }
        },
        autos: {
            loading: {},
            iScroll: {}
        },
        init: function(params){
            var _this = this,
                tpl = this.$el.find('script').text();
            this.model.bind('reset', function(e, data){
                _this.$el.find('.scroller').html(Mustache.to_html(tpl, data));
                _this.$el.find('.et-check').eq(0).trigger('tap');
            });
            this.model.bind('dataerror', function(e, data){
                //没有收获地址
                if(data.code === 903){
                    _this.app.navPage('AddressPage');
                }
            });
            this.model.bind('change', function(e, data){
                _this.$el.find('.real-price').text(data.price);
            });
            this.reset(params);
        },
        reset: function(data){
            //TODO
            data = $.extend({
                sku: '',
                sid: '8f417536ba8912d201188f27e83db1b8'
            }, data);

            data = data || this.previousData;
            this.model.fetch({
                data: $.extend({}, this.model.server.data, data)
            });
            if(data){
                this.previousData = $.extend({}, data);
            }
        },
        checkbox: function(e, sender){
            var $sender = $(sender);
            this.$el.find('.et-check').removeClass('on');
            $sender.addClass('on');
            this.model.set({
                shipping: $sender.data('value'),
                price: (($sender.data('price') - 0) + (this.model.get('total_price') - 0)).toFixed(2)
            });
        },
        getData: function(){
            return {
                method: 'center.order.create',
                sid: '8f417536ba8912d201188f27e83db1b8',
                num: this.previousData.num || 1,
                num_iid: this.previousData.num_iid,
                sku: this.previousData.sku,
                addressid: this.model.get('address.addressid'),
                ext: this.model.get('ext'),
                shipping: this.model.get('shipping'),
                msg: encodeURIComponent(this.$el.find('#order-msg').val())
            }
        },
        complete: function(){
            var _this = this;
            this.model.ajax({
                url: '',
                data: this.getData()
            }, {
                success: function(data){
                    _this.app.pay($.extend({
                        token: '8f417536ba8912d201188f27e83db1b8'
                    }, data.data));
                }
            })
        }
    });
})();