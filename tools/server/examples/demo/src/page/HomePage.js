define('homePage', ['easy-touch-core'], function(){
    return $.EasyTouch.Page.extend({
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
});