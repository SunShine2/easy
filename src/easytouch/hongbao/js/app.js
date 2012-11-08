$(function(){
    var App = $.EasyTouch.extend({
        id: 'hongbao',
        defaultAnimation: 'slideRightIn',
        debug: true,
        pages: {
            IndexPage: window.IndexPage,
            HBDetailPage: window.HBDetailPage,
            PersonPage: window.PersonPage,
            PersonEditPage: window.PersonEditPage,
            AddressPage: window.AddressPage,
            AddressEditPage: window.AddressEditPage,
            OrderListPage: window.OrderListPage,
            OrderDetailPage: window.OrderDetailPage,
            OrderSubmitPage: window.OrderSubmitPage
        },
        events: {
            '[data-action="navPage"]': {
                tap: 'nav'
            },
            '[data-action="pageBack"]': {
                tap: 'back'
            },
            '.et-btn': {
                touchstart: function(e, sender){
                    $(sender).addClass('active');
                },
                touchend: function(e, sender){
                    $(sender).removeClass('active');
                }
            }
        },
        init: function(params){
            this.history.start({
                id: 'IndexPage'
            });
        },
        nav: function(e, sender){
            e.preventDefault();
            var $target = $(sender),
                data = JSON.parse($target.data('params'));
            this.navPage(data.id, data.params);
        },
        back: function(e, sender){
            e.preventDefault();
            var $target = $(sender),
                data = $target.data('params')?JSON.parse($target.data('params')):{};
            this.pageBack(data.params, data.anim);
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
            el = typeof el === 'string'?document.querySelector(el):el;
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