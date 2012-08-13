/**
 * 测试Zepto核心模块
 * @version : 0-0-1
 * @author : butian.wth
 */

describe('测试Zepto对传入对象字面量的支持功能，用于绑定自定义函数：', function() {
    it('如果testValue是一个函数,因为函数传入是作为ready的回调，则$(testValue)的selector属性不应为‘customEvents’', function() {
        var testValue = function() {
        };
        expect($(testValue).selector).not.toEqual("customEvents");
    });
    it('如果testValue是一个对象字面量，则$(testValue)的selector属性应为‘customEvents’', function() {
        var testValue = {key:1,value:2};
        expect($(testValue).selector).toEqual("customEvents");
    });
    it('如果testValue是一个数字，则$(testValue)的selector属性不应为‘customEvents’', function() {
        var testValue = 1;
        expect($(testValue).selector).not.toEqual("customEvents");
    });
    it('如果testValue是一个正则表达式，则$(testValue)的selector属性不应为‘customEvents’', function() {
        var testValue = /12/;
        expect($(testValue).selector).not.toEqual("customEvents");
    });
    it('如果testValue是一个字符串，则$(testValue)的selector属性不应为‘customEvents’', function() {
        var testValue = 'asdasd';
        expect($(testValue).selector).not.toEqual("customEvents");
    })
});