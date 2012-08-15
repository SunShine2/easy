/**
 * 测试Zepto事件处理模块
 * @version : 0-0-1
 * @author : butian.wth
 */

describe('Zepto自定义事件功能测试：', function() {
    describe('测试简单的解绑和绑定：', function(){
        var testObj = {
            name : 'foolish'
        },
        name,
        testFn = function(){
            name = this.name;
        };
        beforeEach(function() {
            name = "";
        });
        it('测试绑定自定义事件以及触发自定义事件的功能是否通过', function() {
            $(testObj).bind('testEvent01', testFn);
            $(testObj).trigger('testEvent01');
            expect(name).toEqual('foolish');
        });
        it("测试解绑自定义事件的功能", function(){
            $(testObj).unbind('testEvent01', testFn);
            $(testObj).trigger('testEvent01');
            expect(name).not.toEqual('testEvent01');
        });
        it('测试解绑功能，只传一个参数', function(){
            $(testObj).bind('testEvent01', testFn);
            $(testObj).unbind('testEvent01');
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
        beforeEach(function(){
            $(testObj).unbind('testEvent01');
            index = 1;
        });
        it('测试重复绑定', function(){
            $(testObj).bind('testEvent01', testFn);
            $(testObj).bind('testEvent01', testFn);
            $(testObj).trigger('testEvent01');
            expect(index).toEqual(3)
        });
        it('测试解绑所有监听器的功能，只传一个参数', function(){
            $(testObj).bind('testEvent01', testFn);
            $(testObj).bind('testEvent01', testFn);
            $(testObj).bind('testEvent01', testFn);
            $(testObj).unbind('testEvent01');
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

        beforeEach(function(){
            $(testObj).unbind(eventObj01);
            $(testObj).unbind(eventObj02);
            index = 1;
        });

        it("测试数组形式多事件的绑定和解绑功能：", function(){
            $(testObj).bind(eventObj01, testFn);
            $(testObj).trigger('event01');
            $(testObj).trigger('event02');
            expect(index).not.toEqual(3)
        });

        it("测试字符串形式多事件的绑定和解绑功能：", function(){
            $(testObj).bind(eventObj02, testFn);
            $(testObj).trigger('event01');
            $(testObj).trigger('event02');
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
            $(testObj).bind(event, testFn);
            $(testObj).trigger(event, dataObj);
            expect(index).toEqual(3);
        })
    })
});