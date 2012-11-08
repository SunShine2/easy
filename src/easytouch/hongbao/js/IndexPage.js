;(function(){
    window.IndexPage = $.EasyTouch.Page.extend({
        html: '#IndexPage',
        events: {
            '[data-action="exit"]': {
                tap: 'exitApp'
            }
        },
        exitApp: function(){
            this.app.exit();
        }
    });
})();