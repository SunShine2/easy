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
            $.subscribe('testEvent01', testFn, testObj);
            $.publish('testEvent01');
            expect(name).toEqual('foolish');
        });
        it("测试解绑自定义事件的功能", function () {
            $.unSubscribe('testEvent01', testFn);
            $.publish('testEvent01');
            expect(name).not.toEqual('testEvent01');
        });
        it('测试解绑功能，只传一个参数', function () {
            $.subscribe('testEvent01', testFn, testObj);
            $.unSubscribe('testEvent01');
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
            $.unSubscribe('testEvent01');
            index = 1;
        });
        it('测试重复绑定', function () {
            $.subscribe('testEvent01', testFn, testObj);
            $.subscribe('testEvent01', testFn, testObj);
            $.publish('testEvent01');
            expect(index).toEqual(3)
        });
        it('测试解绑所有监听器的功能，只传一个参数', function () {
            $.subscribe('testEvent01', testFn, testObj);
            $.subscribe('testEvent01', testFn, testObj);
            $.subscribe('testEvent01', testFn, testObj);
            $.unSubscribe('testEvent01');
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
                index = data.index
            },
            dataObj = {
                index:3
            };

        it('测试简单数据的传递', function () {
            $.subscribe(event, testFn, testObj);
            $.publish(event, dataObj);
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
            $.subscribe(event, testFn, testObj01);
            $.subscribe(event, testFn, testObj02);
            $.publish(event, dataObj, testObj01);
            expect(name).toEqual('testObj01');
        })
    })
});