;(function(){
    window.AddressPage = $.EasyTouch.Page.extend({
        html: '#AddressPage',
        events: {
        },
        init: function(){
            this.iScroll = this.app.iScroll(this.el.querySelector('.et-iScroll'), {
                checkDOMChanges: true
            });
        }
    });
})();