;(function(){
    window.OrderSubmitPage = $.EasyTouch.Page.extend({
        html: 'html/OrderSubmitPage.html',
        events: {},
        init: function(){
            this.iScroll = this.app.iScroll(this.el.querySelector('.et-iScroll'), {
                checkDOMChanges: true
            });

            this.app.bind('address-change', function(e, params){
                //更新地址
            });
        }
    });
})();