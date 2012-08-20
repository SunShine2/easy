/**
 * 测试custom event模块
 * @version : 0-0-1
 * @author : butian.wth
 */

describe('测试自定义事件模块', function () {

    describe('测试简单的解绑和绑定：', function () {
        var testObj = {
                name:'foolish'
            },
            name,
            testFn = function () {
                name = this.name;
            };
        beforeEach(function () {
            name = "";
        });
        it('测试绑定自定义事件以及触发自定义事件的功能是否通过', function () {
            $.bind('testEvent01', testFn, testObj);
            $.trigger('testEvent01');
            expect(name).toEqual('foolish');
        });
        it("测试解绑自定义事件的功能", function () {
            $.unbind('testEvent01', testFn);
            $.trigger('testEvent01');
            expect(name).not.toEqual('testEvent01');
        });
        it('测试解绑功能，只传一个参数', function () {
            $.bind('testEvent01', testFn, testObj);
            $.unbind('testEvent01');
            expect(name).toEqual('')
        });
    });
    describe('测试多次解绑和绑定：', function () {
        var testObj = {
                name:'foolish'
            },
            index = 1,
            testFn = function () {
                index = index + 1;
                return index;
            };
        beforeEach(function () {
            $.unbind('testEvent01');
            index = 1;
        });
        it('测试重复绑定', function () {
            $.bind('testEvent01', testFn, testObj);
            $.bind('testEvent01', testFn, testObj);
            $.trigger('testEvent01');
            expect(index).toEqual(3)
        });
        it('测试解绑所有监听器的功能，只传一个参数', function () {
            $.bind('testEvent01', testFn, testObj);
            $.bind('testEvent01', testFn, testObj);
            $.bind('testEvent01', testFn, testObj);
            $.unbind('testEvent01');
            expect(index).toEqual(1)
        });
    });
    describe('测试触发事件时data数据的传递：', function () {
        var event = 'event',
            testObj = {
                name:'testObj01'
            },
            index = 1,
            testFn = function (e, data) {
                console.log(arguments);
                index = data.index
            },
            dataObj = {
                index:3
            };

        it('测试简单数据的传递', function () {
            $.bind(event, testFn, testObj);
            $.trigger(event, dataObj);
            expect(index).toEqual(3);
        })
    });
    describe('测试多宿主事件的解绑和触发:', function(){
        var event = 'event',
            testObj01 = {
                name:'testObj01'
            },
            testObj02 = {
                name:'testObj02'
            },
            name,
            testFn = function (e, data) {
                name = this.name;
            },
            dataObj = {
                index:3
            };

        it('测试简单数据的传递', function () {
            $.bind(event, testFn, testObj01);
            $.bind(event, testFn, testObj02);
            $.trigger(event, dataObj, testObj01);
            expect(name).toEqual('testObj01');
        })
    })
});