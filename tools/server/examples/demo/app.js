define('app', ['cssLoader', 'css!reset-style', 'css!common-style', 'css!demo-style', 'easy-touch-core','css!demo-anim', 'homePage', 'page2'], function (CSS_LOADER, RESET_STYLE, COMMON_STYLE, DEMO_STYLE, $, DEMO_ANIM, homePage, page2) {
    var App = $.EasyTouch.App.extend({
        id: 'hongbao',
        container:'#pages',
        defaultAnimation: 'slideRightIn',
        debug: true,
        pages: {
            home: homePage,
            page2: page2
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
    return app;
});