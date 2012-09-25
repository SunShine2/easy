;(function(){
    window.IndexPage = $.EasyTouch.Page.extend({
        html: '#IndexPage',
        events: {
            'tap [data-action="exit"]': 'exitApp'
        },
        exitApp: function(){
            this.app.exit();
        }
    });
})();