$(function(){
    var App = $.EasyTouch.extend({
        id: 'hongbao',
        pages: {
            IndexPage: window.IndexPage,
            HBDetailPage: window.HBDetailPage,
            PersonPage: window.PersonPage,
            PersonEditPage: window.PersonEditPage,
            AddressPage: window.AddressPage,
            AddressEditPage: window.AddressEditPage
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
        },
        iScroll: function(el, params){
            var iscroll,
                _params = {
                onBeforeScrollStart: function(e){
                    var tagName = e.target.tagName;
                    if (tagName != 'SELECT' && tagName != 'INPUT' && tagName != 'TEXTAREA'){
                        e.preventDefault();
                    }
                }
            };
            params = params || {};
            if(params.checkDOMChanges){
                el.addEventListener('touchstart', function(e){
                    if (iscroll.moved || iscroll.zoomed || iscroll.animating || (iscroll.scrollerW == iscroll.scroller.offsetWidth * iscroll.scale && iscroll.scrollerH == iscroll.scroller.offsetHeight * iscroll.scale)) {
                        return;
                    }
                    iscroll.refresh();
                });
                delete params.checkDOMChanges;
            }
            params = $.extend(_params, params);
            return iscroll = new iScroll(el, params);
        }
    });
    window.app = new App();
});