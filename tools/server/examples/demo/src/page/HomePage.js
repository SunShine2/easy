;(function(){
    var page = $.EasyTouch.Page.extend({
        html: '#home',
        events: {
            '[data-action="exit"]':{
                tap:'exitApp'
            }
        },
        exitApp: function(){
            this.app.exit();
        }
    });
    window.HomePage = page;
})();
