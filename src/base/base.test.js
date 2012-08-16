/**
 * 测试Zepto事件处理模块
 * @version : 0-0-1
 * @author : butian.wth
 */

$.Abc = $.Base.build('a', {
        initializer :function(){
            this.fucked = true;
        },
        getName : function(){
            return this.name
        },
        getStaticName : function(){
            return $.Abc.NAME;
        },
        destructor : function(){

        }
    },{
        width : {
            value : 5,
            validator : /\d/
        },
        height : {
            value : 5,
            setter : function(value){
                return /\d/.test(value)
            }
        },
        name : {
            value : 'wocalei',
            setter : function(value){
                return /.+/.test(value)
            },
            validator: /\d/
        }
    },{
        NAME : '这是静态属性'
    });

var testA = new $.Abc({name:'testA'}),
    testB = new $.Abc({name:'testB'});

console.log(testA.get('fucked'));
testA.subscribe('attrChange', function(e){
    console.log('属性改变了：' + e.attrKey + ':' + e.attrValue);
});
testA.set('name','c');
console.log('testA的name属性',testA.get('name'));
testA.set('width','a');
console.log('testA的width属性',testA.get('width'));
console.log('testA的静态属性',testA.getStaticName());

console.log('testB的name属性',testB.getName());
console.log('testB的width属性',testB.get('width'));
console.log('testB的静态属性',testB.getStaticName());