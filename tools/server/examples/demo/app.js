;(function(){
    var App = $.EasyTouch.extend({
        id: 'hongbao',
        container:'#pages',
        defaultAnimation: 'slideRightIn',
        debug: true,
        pages: {
            home: window.HomePage,
            page2:window.Page2
        },
        events: {
            '[data-action="nav"]':{
                tap:'nav'
            },
            '.page-back': {
                tap: function(){
                    this.pageBack();
                }
            }

        },
        init: function(params){
            this.history.start({
                id: 'home'
            });
        },
        nav: function(e, sender){
            e.preventDefault();
            var $target = $(sender);
            var data = JSON.parse($target.data('params'));
            this.navPage(data.id, data.params, null, data.history);
        }
    });
    window.app = new App();
})();