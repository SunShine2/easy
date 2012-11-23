/**
 * 红包组件
 *
 *      //打开红包组件的订单确认页
 *      app.navApp('hongbao', {
 *          cloud_app_id: xxx,  //红包团队权限ID，用来查询APP的app key和app secret
 *          sign: xxx,
 *          page: {
 *              id: 'OrderSubmitPage',
 *              data: {
 *                  appid: xxx,
 *                  sku: xxx,
 *                  num: 2
 *              }
 *          }
 *      });
 *
 * @author: youxiao@alibaba-inc.com
 * @version: 0.0.1
 * @module hongbao
 * @param {String} id 页面ID
 * @param {Object} data 页面参数
 */
$(function(){
    var App = $.EasyTouch.App.extend({
        id: 'hongbao',
        defaultAnimation: 'slideRightIn',
        debug: true,
        model: new window.Model,
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
            var _this = this;
            params = params || {};
            if(params.cloud_app_id){
                this.model.set({
                    cloud_app_id: params.cloud_app_id
                });
                if(params.sign){
                    this.model.set('sign', params.sign);
                }
            }
            if(params.page){
                this.navPage(params.page.id, params.page.data);
            }else{
                this.navPage('IndexPage');
            }

            this.model.bind('beforeSend', function(){
                _this.showLoading({
                    msg: i18n.loadding,
                    modal: true
                });
            });
            this.model.bind('complete', function(){
                _this.hideLoading();
            });
        },
        reset: function(params){
            params = params || {};
            if(params.page){
                this.navPage(params.page.id, params.page.data);
            }else{
                this.navPage('IndexPage');
            }
        },
        pause: function(){
            this.model.set('sign', null);
        },
        checkNet: function(callback){
            var _this = this,
                connection = navigator.network.connection;
            if(!connection.onLine){
                if(!this.netErrorDialog){
                    var buttons = {};
                    buttons[i18n.dialog_ok] = function(){
                        this.close();
                        connection.setting(_this._netErrorCallback);
                    };
                    buttons[i18n.dialog_cancel] = function(){
                        this.close();
                    };
                    this.netErrorDialog = new $.EasyDialog({
                        title: i18n.net_dialog_title,
                        content: i18n.net_dialog_content,
                        buttons: buttons
                    });
                }
                this._netErrorCallback = callback;
                this.netErrorDialog.open();
            }else{
                callback();
            }
        },
        getSign: function(callback, getSignFromServer){
            var _this = this;
            if(this.model.get('sign') && !getSignFromServer){
                callback && callback(this.model.get('sign'));
                return;
            }
            if(halo.mobile){
                var sign = navigator.pim.peekSign();
                console.log('[hongbao][CloudAPI][peekSign]: ' + sign);
                if(!sign || getSignFromServer){
                    this.showLoading({
                        msg: i18n.sign_start,
                        modal: true
                    });
                    navigator.pim.getSign(function(sign){
                        console.log('[hongbao][CloudAPI][getSign]: ' + sign);
                        _this.hideLoading();
                        _this.model.set('sign', sign);
                        callback && callback(sign);
                    }, function(){
                        _this.hideLoading();
                        navigator.notification.toast(i18n.sign_error);
                    }, true);
                }else{
                    this.model.set('sign', sign);
                    callback && callback(sign);
                }
            }else{
                $.ajax({
                    url: 'http://10.249.195.165/newopenapi/createsign.php?appid=60985&tyuid=atcaptest1',
                    dataType: 'json',
                    success: function(data){
                        if (data.code == 200) {
                            _this.model.set('sign', data.data);
                            callback && callback(data.data);
                        }
                    }
                });
            }
        },
        bindTaobao: function(callback){
            var _this = this;
            this.showLoading({
                msg: i18n.bind_taobao,
                modal: true
            });
            navigator.pim.bindTaobao(function(){
                _this.hideLoading();
                _this.model.ajax({
                    url: 'center/user/bindtaobao/'
                }, {
                    success: function(data){
                        navigator.notification.toast(i18n.bind_taobao_success);
                        console.log('[hongbao]taobao_nick: ' + data.data.taobao_nick);
                        callback && callback(data.data);
                    }
                });
            }, function(){
                _this.hideLoading();
                navigator.notification.toast(i18n.bind_taobao_error);
            });
        },
        pay: function(data, success, error){
            var _this = this;
            console.log('[hongbao][CloudAPI][taobaopay] alipay_trade_no: '+data.alipay_trade_no+', token: '+data.token);
            navigator.pay.taobaopay(data.alipay_trade_no, data.token, function(){
                _this.model.ajax({
                    url: '',
                    data: {
                        method: 'center.order.complete',
                        alipay_trade_no: data.alipay_trade_no
                    }
                }, {
                    success: function(){
                        _this.navPage('OrderDetailPage', {
                            trade_no: data.trade_no
                        });
                    }
                });
            }, error)
        },
        navPage: function(pid){
            var _this = this,
                argu = arguments;
            if(!this.getPage(pid)){
                this.checkNet(function(){
                    _this.super.navPage.apply(_this, argu);
                });
            }else{
                this.super.navPage.apply(this, argu);
            }
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