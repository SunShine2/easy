;(function(){
    var Address = window.Model.extend({
        server: {
            url: 'center/address/info/',
            data: {}
        },
        parse: function(data){
            return data.data;
        }
    });

    window.AddressEditPage = window.Page.extend({
        html: 'html/AddressEditPage.html',
        model: new Address,
        divisionData: {},
        autos: {
            loading: {}
        },
        events: {
            '#address-complete': {
                tap: 'complete'
            },
            '.et-select': {
                change: 'cdselector'
            }
        },
        init: function(params){
            this.reset(params);
            this.$el.find('.et-text').bind('blur', function(){
                this.value = $.trim(this.value);
            });
            this.tpl = this.$el.find('script').text();
        },
        reset: function(params){
            var _this = this,
                title = '编辑收货地址';
            this.isEdit = !!params.deliverId;
            this.deliverId = params.deliverId;
            if(this.isEdit){
                this.model.fetch({
                    data: {
                        deliverId: params.deliverId
                    }
                }, {
                    success: function(data){
                        data = this.toJSON();
                        _this.initForm(data);

                    }
                });
            }else{
                title = '新建收货地址';
                this.clearForm();
            }
            this.$el.find('h1').text(title);
        },
        clearForm: function(){
            var _this = this;
            $('#address-name').val('');
            $('#address-mobile').val('');
            $('#address-detail').val('');
            this.getProvince({
                success: function(data){
                    var tpl = _this.$el.find('script').text();
                    $('#address-area-p').html(Mustache.to_html(tpl, {
                        list: data
                    }));
                    $('#address-area-a').html(Mustache.to_html(tpl, {
                        list: []
                    }));
                    $('#address-area-c').html(Mustache.to_html(tpl, {
                        list: []
                    }));
                }
            })
        },
        initForm: function(data){
            var info = data.info,
                divisionCode = info.divisionCode,
                provinceCode = divisionCode.substring(0, 2) + '0000',
                cityCode = divisionCode.substring(0, 4) + '00',
                $p = $('#address-area-p'),
                $c = $('#address-area-c'),
                $a = $('#address-area-a');
            $('#address-name').val(info.fullName);
            $('#address-mobile').val(info.mobile);
            $('#address-detail').val(info.addressDetail);
            $p.html(Mustache.to_html(this.tpl, {
                list: data.province.province
            }));
            $c.html(Mustache.to_html(this.tpl, {
                list: data.city.childDivision
            }));
            $a.html(Mustache.to_html(this.tpl, {
                list: data.area.childDivision
            }));
            this.divisionData['province'] = data.province.province;
            this.divisionData[provinceCode] = data.city.childDivision;
            this.divisionData[cityCode] = data.area.childDivision;

            $p.val(provinceCode);
            $c.val(cityCode);
            $a.val(divisionCode);
        },
        cdselector: function(e, sender){
            var _this = this,
                $select = $(sender),
                $option = _this.getCurrentOption($select);
            if($option.data('leaf') === '1' || $select.val() === ''){
                return;
            }
            var divisionCode = sender.value;
            _this.getDistrict(divisionCode, {
                success: function(data){
                    $select.next().html(Mustache.to_html(_this.tpl, {
                        list: data
                    }));
                    if($select.next().next()){
                        $select.next().next().html(Mustache.to_html(_this.tpl, {
                            list: []
                        }));
                    }
                }
            });
        },
        getProvince: function(settings){
            var _this = this,
                _success = settings.success,
                cache = this.divisionData['province'];
            if(cache){
                return _success.apply(this, [cache]);
            }
            settings.success = function(data){
                data = data.data.province;
                _this.divisionData['province'] = data;
                _success.apply(_this, [data])
            };
            this.model.ajax({
                url: 'center/address/province/'
            }, settings);
        },
        getDistrict: function(divisionCode, settings){
            var _this = this,
                _success = settings.success,
                cache = this.divisionData[divisionCode];
            if(cache){
                return _success.apply(this, [cache]);
            }
            settings.success = function(data){
                var data = data.data.childDivision;
                _this.divisionData[divisionCode] = data;
                _success.apply(_this, [data]);
            };
            this.model.ajax({
                url: 'center/address/district/',
                data: {
                    divisionCode: divisionCode
                }
            }, settings);
        },
        check: function(){
            var name = $('#address-name').val(),
                mobile = $('#address-mobile').val(),
                detail = $('#address-detail').val(),
                area = $('#address-area-a').val();
            if(name === ''){
                return alert('收货人不能为空');
            }
            if(!/.{2,15}/.test(name)){
                return alert('收货人必须为2~15位');
            }
            if(mobile === ''){
                return alert('手机号码不能为空');
            }
            if(!/^(((13[0-9])|(15[0-3,5-9])|(18[0,5-6,7-9]))([0-9]{8}))$/.test(mobile)){
                return alert('请填写有效的手机号码');
            }
            if(area === ''){
                return alert('请选择地址');
            }
            if(detail === ''){
                return alert('详细地址不能为空');
            }
            if(!/.{5,60}/.test(detail)){
                return alert('详细地址必须为5~60位');
            }
            if(/^\d+$/.test(detail)){
                return alert('详细地址不能全是数字');
            }
            if(/^[a-zA-Z]+$/.test(detail)){
                return alert('详细地址不能全是字符');
            }
            return true;
        },
        getData: function(){
            var $option = this.getCurrentOption('#address-area-a');
            return {
                deliverId: this.deliverId,
                fullName: $('#address-name').val(),
                mobile: $('#address-mobile').val(),
                post: $option.data('post')?$option.data('post'):this.getCurrentOption('#address-area-c').data('post'),
                divisionCode: $option.attr('value'),
                addressDetail: $('#address-detail').val()
            }
        },
        getCurrentOption: function(selector){
            var $select = typeof selector === 'string'?$(selector):selector,
                val = $select.val();
            return $select.find('[value="'+val+'"]');
        },
        complete: function(){
            var _this = this;
            if(this.check() !== true){
                return;
            }
            var data = $.extend(this.getData(), {
                province: _this.getCurrentOption('#address-area-p').text(),
                city: _this.getCurrentOption('#address-area-c').text(),
                area: _this.getCurrentOption('#address-area-a').text()
            });
            if(this.isEdit){
                this.model.ajax({
                    url: 'center/address/edit/',
                    type: 'POST',
                    data: data
                }, {
                    success: function(){
                        navigator.notification.toast(i18n.address_edit_success);
                        _this.app.pageBack({
                            action: 'update',
                            data: data
                        });
                    }
                });
            }else{
                this.model.ajax({
                    url: 'center/address/create/',
                    type: 'POST',
                    data: data
                }, {
                    success: function(_data){
                        navigator.notification.toast(i18n.address_add_success);
                        data.deliverId = _data.data.addressId;
                        _this.app.pageBack({
                            action: 'add',
                            data: data
                        });
                    }
                });
            }
        }
    });
})();