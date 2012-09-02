/**
 * 测试Zepto事件处理模块
 * @version : 0-0-1
 * @author : butian.wth
 */

describe('Zepto自定义事件功能测试：', function() {
    var testObj = {
            name : 'foolish'
        },
        name,
        testFn = function(){
            console.log(this);
            name = this.name;
        },
        test;
    describe('测试简单的解绑和绑定：', function(){
        beforeEach(function() {
            name = "";
            test = $(testObj);
        });
        it('测试绑定自定义事件以及触发自定义事件的功能是否通过', function() {
            test.bind('testEvent01', testFn);
            console.log(testObj._zid);
            test.trigger('testEvent01');
            expect(name).toEqual('foolish');
        });
        it("测试解绑自定义事件的功能", function(){
            test.unbind('testEvent01', testFn);
            test.trigger('testEvent01');
            expect(name).not.toEqual('testEvent01');
        });
        it('测试解绑功能，只传一个参数', function(){
            test.bind('testEvent01', testFn);
            test.unbind('testEvent01');
            expect(name).toEqual('')
        });
    });
    describe('测试多次解绑和绑定：', function(){
        var testObj = {
            name : 'foolish'
        },
        index = 1,
        testFn = function(){
            index = index +1;
            return index;
        };
        beforeEach(function() {
            name = "";
            test = $(testObj);
            index = 1;
        });
        it('测试重复绑定', function(){
            test.bind('testEvent01', testFn);
            test.bind('testEvent01', testFn);
            test.trigger('testEvent01');
            expect(index).toEqual(3)
        });
        it('测试解绑所有监听器的功能，只传一个参数', function(){
            test.bind('testEvent01', testFn);
            test.bind('testEvent01', testFn);
            test.bind('testEvent01', testFn);
            test.unbind('testEvent01');
            expect(index).toEqual(1)
        });
    });
    describe('测试多事件的绑定和解绑功能', function(){
        var eventObj01 = ['event01', 'event02'],
            eventObj02 = 'event01 event02',
            testObj = {
                name : 'testObj'
            },
            index = 1,
            testFn = function(){
                index = index + 1;
                return index
            };

        beforeEach(function() {
            test = $(testObj);
            index = 1;
        });

        it("测试数组形式多事件的绑定和解绑功能：", function(){
            test.bind(eventObj01, testFn);
            test.trigger('event01');
            test.trigger('event02');
            expect(index).not.toEqual(3)
        });

        it("测试字符串形式多事件的绑定和解绑功能：", function(){
            test.bind(eventObj02, testFn);
            test.trigger('event01');
            test.trigger('event02');
            expect(index).toEqual(3)
        });
    });
    describe('测试触发事件时data数据的传递：', function(){
        var event = 'event',
            testObj = {
                name : 'testObj01'
            },
            index = 1,
            testFn = function(e, data){
                index = data.index
            },
            dataObj = {
                index : 3
            };

        it('测试简单数据的传递', function(){
            test.bind(event, testFn);
            test.trigger(event, dataObj);
            expect(index).toEqual(3);
        })
    })
});