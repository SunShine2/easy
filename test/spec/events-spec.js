/**
 * 测试events模块
 * @version : 0-0-1
 * @author : youxiao@alibaba-inc.com
 */
var events = new $.Events();
describe('event type：', function(){
    it('自定义事件的type', function () {
        events.bind('testEvent01', function(e, data){
            expect(e.type).toEqual('testEvent01');
        });
        events.trigger('testEvent01');
    });
});
describe('trigger参数：', function () {
    it("trigger时提供一个参数", function () {
        events.bind('testEvent02', function(e, data){
            expect(data).toEqual(1);
        });
        events.trigger('testEvent02', 1);
    });
    it("trigger时提供一个数组参数", function () {
        events.bind('testEvent03', function(e, data){
            expect(data).toEqual([1]);
        });
        events.trigger('testEvent03', [1]);
    });
    it("trigger时提供多个参数", function () {
        events.bind('testEvent04', function(e, data1, data2){
            expect(data1).toEqual(1);
            expect(data2).toEqual(2);
        });
        events.trigger('testEvent04', 1, 2);
    });
});
describe('绑定多个事件：', function(){
    var foo;
    beforeEach(function() {
        foo = {
            fun: function() {},
            fun2: function() {}
        };
        spyOn(foo, 'fun');
        events.bind('testEvent05 testEvent06', foo.fun);
        events.trigger('testEvent05');
        events.trigger('testEvent06');
        spyOn(foo, 'fun2');
        events.bind('testEvent07 testEvent08', foo.fun2);
        events.trigger('testEvent07 testEvent08');
    });
    it('多次trigger', function () {
        expect(foo.fun).toHaveBeenCalled();
    });
    it('一次trigger完', function () {
        expect(foo.fun2).toHaveBeenCalled();
    });
    it('event type', function () {
        events.bind('testEvent09 testEvent10', function(e, data){
            expect(e.type).toMatch(/testEvent09|testEvent10/);
        });
        events.trigger('testEvent09 testEvent10');
    });
});
describe('绑定事件All：', function(){
    var foo;
    beforeEach(function() {
        foo = {
            fun: function() {}
        };
        spyOn(foo, 'fun');
        events.bind('all', foo.fun);
        events.trigger('testEvent11');
    });
    it('绑定事件All', function () {
        expect(foo.fun).toHaveBeenCalled();
    });
    it('event type', function () {
        events.bind('all', function(e, data){
            expect(e.type).toEqual('testEvent12');
        });
        events.trigger('testEvent12');
    });
});