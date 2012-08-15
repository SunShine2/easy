/**
 *  easy框架基类，用于创建easy组件，参考YUI3
 *  author : butian.wth
 *  version : 0-0-1
 */

(function($){

    function addCustomEvent(){
        this.subscribe = function(){
            return $.subscribe(arguments, this)
        };
        this.unSubscribe = function(){
            return $.unSubscribe(arguments, this)
        };
        this.publish = function(){
            return $.publish(arguments, this)
        }
    }

    /**
     * 基础base对象，用于扩展
     * @constructor
     */
    function Base(){

        addCustomEvent.call(this);
        this.name = this.constructor.NAME;

        this.init.apply(this, arguments)
    }
})(Zepto);