$(function(){
    var App = $.EasyTouch.extend({
        id: 'hongbao',
        pages: {
            IndexPage: window.IndexPage,
            HBDetailPage: window.HBDetailPage,
            PersonPage: window.PersonPage,
            PersonEditPage: window.PersonEditPage
        },
        events: {
            'tap [data-action="navPage"]': 'nav',
            'tap [data-action="pageBack"]': 'back'
        },
        init: function(params){
            this.history.start({
                id: 'IndexPage'
            });
        },
        nav: function(e, sender){
            e.preventDefault();
            var $target = $(sender);
            var data = JSON.parse($target.data('params'));
            this.navPage.apply(this, [data.id, data.params, data.anim]);
        },
        back: function(e, sender){
            e.preventDefault();
            var $target = $(sender);
            var data = $target.data('params')?JSON.parse($target.data('params')):{};
            this.pageBack.apply(this, [data.params, data.anim]);
        }
    });
    window.app = new App();
});