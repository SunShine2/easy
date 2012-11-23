;(function(){
    var Person = window.Model.extend({
        server: {
            url: 'center/user/info/'
        },
        parse: function(data){
            return data.data;
        }
    });
    window.PersonPage = window.Page.extend({
        html: 'html/PersonPage.html',
        model: new Person,
        autos: {
            loading: {}
        },
        init: function(){
            var _this = this;
            this.model.bind('reset', function(e, data){
                _this.renderPerson(data);
            });
            this.model.bind('change', function(e, data){
                _this.renderPerson(data);
            });
            this.model.fetch();
        },
        renderPerson: function(data){
            data.gender = data.gender === '1'?'男':'女';
            this.$el.find('.container').html(Mustache.to_html(this.$el.find('script').text(), data))
        },
        reset: function(data){
            if(!data){
                return;
            }
            this.model.set(data);
        }
    });
})();