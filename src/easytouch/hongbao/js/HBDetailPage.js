;(function(){
    var Balance = window.Model.extend({
        server: {
            url: 'center/hongbao/balance/'
        },
        parse: function(data){
            return data.data;
        }
    });

    var HBDetailList = window.Model.extend({
        server: {
            url: 'center/hongbao/list/',
            data: {
                perpage: 10
            }
        },
        watch: {
            curpage: 'data curpage',
            hasnext: 'data hasnext'
        },
        parse: function(data){
            return data.data.list;
        }
    });

    window.HBDetailPage = window.Page.extend({
        html: 'html/HBDetailPage.html',
        balance: new Balance,
        model: new HBDetailList,
        events: {
            '.et-load-more': {
                tap: 'getNext'
            }
        },
        init: function(){
            var _this = this;
            this.balance.bind('reset', function(e, params){
                var $summary = _this.$el.find('.summary');
                $summary.find('.et-hb-use').text(params.data.hongbao);
                $summary.find('.et-hb-freeze').text(params.data.unable_hongbao);
            });

            var tpl = _this.$el.find('script').html();
            this.model.bind('add', function(e, params){
                console.log(params);
                var html = Mustache.to_html(tpl, {
                    list: params.data
                });
                _this.$el.find('.et-list').append(html);
            });

            this.balance.fetch();
            this.model.fetch();
        },
        getNext: function(){
            this.model.getNext({
                page: this.model.attrs.curpage + 1
            });
        }
    });
})();