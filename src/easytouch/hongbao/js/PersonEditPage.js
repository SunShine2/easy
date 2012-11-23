;(function(){
    var Person = window.Model.extend({
        server: {
            url: 'center/user/info/'
        },
        parse: function(data){
            return data.data;
        }
    });
    window.PersonEditPage = window.Page.extend({
        html: 'html/PersonEditPage.html',
        model: new Person,
        autos: {
            loading: {}
        },
        events: {
            '.person-bind-taobao': {
                tap: 'bindTaobao'
            },
            '#person-complete': {
                tap: 'complete'
            }
        },
        init: function(){
            var _this = this;
            this.model.bind('reset', function(e, data){
                _this.renderPerson(data);
            });
            this.model.bind('change', function(e, data){
                _this.renderPerson(data);
            });
            this.$el.find('#person-mobile').bind('blur', function(){
                this.value = $.trim(this.value);
            });
            this.reset();
        },
        renderPerson: function(data){
            var birthday = data.birthday?data.birthday.split('-'):['','',''],
                genders = this.$el.find('.gender input');
            $('#person-username').val(data.username);
            $('#person-mobile').val(data.mobile);
            $('#person-b-year').val(birthday[0]);
            $('#person-b-month').val(birthday[1]);
            $('#person-b-day').val(birthday[2]);
            if(data.gender === '1'){
                genders = genders[0];
            }else if(data.gender === '0'){
                genders = genders[1];
            }else{
                genders = genders[2];
            }
            genders.setAttribute('checked', 'checked');
            if(data.taobao_nick){
                $('#person-taobao-ready').show();
                $('#person-taobao-unready').hide();
                $('#person-taobao-nick').text(data.taobao_nick);
            }else{
                $('#person-taobao-unready').show();
                $('#person-taobao-ready').hide();
            }
        },
        reset: function(){
            this.model.fetch();
        },
        bindTaobao: function(){
            var _this = this;
            this.app.bindTaobao(function(data){
                _this.model.set({
                    taobao_nick: data.taobao_nick
                });
            });
        },
        check: function(){
            var mobile = $('#person-mobile').val();
            if(!/^(((13[0-9])|(15[0-3,5-9])|(18[0,5-6,7-9]))([0-9]{8}))$/.test(mobile)){
                return alert('请填写有效的手机号码');
            }
            return true;
        },
        getData: function(){
            var taobao_nick = this.model.toJSON().taobao_nick,
                mobile = $('#person-mobile').val(),
                year = $('#person-b-year').val(),
                month = $('#person-b-month').val(),
                day = $('#person-b-day').val(),
                genders = this.$el.find('.gender input');
            var data = {};
            if(taobao_nick){
                data.taobao_nick = taobao_nick;
            }
            if(mobile){
                data.mobile = mobile;
            }
            if(year && month && day){
                $.extend(data, {
                    birthday_year: year,
                    birthday_month: month,
                    birthday_day: day
                });
            }
            data.gender = '0';
            if(genders[0].checked){
                data.gender = '1';
            }
            if(genders[1].checked){
                data.gender = '2';
            }
            return data;
        },
        complete: function(){
            var _this = this,
                data = this.getData();
            this.model.save({
                url: 'center/user/edit/',
                data: data
            }, {
                success: function(){
                    navigator.notification.toast(i18n.person_edit_success);
                    var _data = {
                        mobile: data.mobile,
                        gender: data.gender
                    };
                    if(data.birthday_year){
                        _data.birthday = [data.birthday_year, data.birthday_month, data.birthday_day].join('-');
                    }
                    _this.app.pageBack($.extend(this.toJSON(),_data));
                }
            })
        }
    });
})();