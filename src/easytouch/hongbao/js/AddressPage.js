;(function(){
    var Address = window.Model.extend({
        server: {
            url: 'center/address/delete/'
        },
        init: function(){

        }
    });
    var AddressList = window.ModelList.extend({
        model: Address,
        server: {
            url: 'center/address/list/'
        },
        parse: function(data){
            return data.data.addressList;
        }
    });
    var View = $.EasyTouch.View.extend({
        container: '<li></li>',
        events: {
            '.et-del': {
                tap: 'del'
            },
            '': {
                tap: 'setDefault'
            }
        },
        init: function(options){
            var _this = this;
            $.extend(this, options);
            this.model.bind('change', function(){
                _this.render();
            });
            this.model.bind('remove', function(){
                _this.destroy();
            });
        },
        del: function(e){
            e.stopPropagation();
            this.page.currentAddressModel = this.model;
            this.page.dialog.open();
        },
        setDefault: function(e){
            if(e.target.nodeName.toLowerCase() === 'a'){
                return;
            }
            var model = this.model;
            model.ajax({
                url: 'center/address/setdefault/',
                data: {
                    deliverId: model.toJSON().deliverId
                }
            },{
                success: function(){
                    navigator.notification.toast(i18n.address_default_success);
                    model.set('status', 1);
                }
            })
        }
    });

    window.AddressPage = window.Page.extend({
        html: 'html/AddressPage.html',
        model: new AddressList,
        autos: {
            loadMoreBtn: {},
            loading: {},
            iScroll: {}
        },
        events: {
            '.et-back': {
                tap: 'back'
            }
        },
        init: function(){
            var _this = this;
            this.model.bind('reset', function(e, models){
                _this.addAddress(models);
            });
            this.model.bind('add', function(e, models){
                _this.addAddress(models);
            });
            this.model.fetch();
            this.initDialog();
        },
        initDialog: function(){
            var buttons = {}, _this = this;
            buttons[i18n.address_dialog_del] = function(){
                this.close();

                var model = _this.currentAddressModel;
                model.remove({
                    url: 'center/address/delete/',
                    data: {
                        deliverId: model.toJSON().deliverId
                    }
                },{
                    success: function(){
                        navigator.notification.toast(i18n.address_del_success);
                    }
                });
            };
            buttons[i18n.dialog_cancel] = function(){
                this.close();
            };
            this.dialog = new $.EasyDialog({
                title: i18n.address_dialog_title,
                content: i18n.address_dialog_content,
                buttons: buttons
            });
        },
        addAddress: function(models){
            var _this = this,
                tpl = this.$el.find('script').text(),
                addressList = this.$el.find('.address-list');
            models.forEach(function(item){
                var view = new View({
                    model: item,
                    app: _this.app,
                    page: _this,
                    tpl: tpl
                }).render();
                addressList.append(view.$el);
                _this.initLoading({
                    model: item
                });
            });
        },
        reset: function(params){
            if(!params){
                return;
            }
            if(params.action === 'update'){
                var model = this.model.where({
                    deliverId: params.data.deliverId
                })[0];
                model.set(params.data);
            }else if(params.action === 'add'){
                this.model.add(params.data);
            }
        },
        back: function(){
            var data,
                model = this.model.where({
                    status: 1
                })[0];
            if(model){
                data = model.toJSON();
            }
            this.app.pageBack(data);
        }
    });
})();