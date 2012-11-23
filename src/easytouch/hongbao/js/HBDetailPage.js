;(function(){
    var Balance = window.Model.extend({
        server: {
            url: 'center/hongbao/balance/'
        },
        parse: function(data){
            return data.data;
        }
    });

    var HBDetailList = window.ModelList.extend({
        server: {
            url: 'center/hongbao/list/',
            data: {
                perpage: 10
            }
        },
        watch: {
            curpage: 'data.curpage',
            hasnext: 'data.hasnext'
        },
        parse: function(data){
            return data.data.list;
        }
    });

    window.HBDetailPage = window.Page.extend({
        html: 'html/HBDetailPage.html',
        balance: new Balance,
        model: new HBDetailList,
        autos: {
            loadMoreBtn: {},
            loading: {},
            iScroll: {}
        },
        events: {
            '.et-load-more': {
                tap: 'getNext'
            }
        },
        init: function(){
            var _this = this;
            this.balance.bind('reset', function(e, model){
                var $summary = _this.$el.find('.summary');
                $summary.find('.et-hb-use').text(model.hongbao);
                $summary.find('.et-hb-freeze').text(model.unable_hongbao);
            });

            this.model.bind('reset', function(e, models){
                _this.renderOrder(models, true);
            });
            this.model.bind('add', function(e, models){
                _this.renderOrder(models);
            });

            this.balance.fetch();
            this.model.fetch();
        },
        renderOrder: function(models, fromReset){
            var tpl = this.$el.find('script').html(),
                html = Mustache.to_html(tpl, {
                    list: this.model.toJSON(models)
                }),
                $list = this.$el.find('.et-list');
            if(fromReset){
                $list.html(html);
            }else{
                $list.append(html);
            }
        },
        getNext: function(){
            this.model.server.data.page = this.model.attrs.curpage + 1;
            this.model.next();
        }
    });
})();