/**
 *  easy框架基类，用于创建easy组件，参考YUI3
 *  author : butian.wth
 *  version : 0-0-1
 *  <h2>使用方法</h2>
 *  <p>本模块依赖于custom-event和core模块，使用方法很简单
 *  $.Base.build(
 *      'moduleName',
 *      {
 *          method : function(){} //挂载在prototype上的方法
 *      },
 *      {
 *          property:{ //该属性可以在初始化的时候进行配置，也可以用set进行设置，get进行获取
 *              value : defaultValue,
 *              setter : function(){}, //用于判断是否符合匹配条件
 *              validator : Reg  //正则匹配
 *          }
 *      },
 *      {
 *          NAME : 'asdasd'  //挂载在模块上的静态方法，不会继承到实例中
 *      }
 *  );
 *  </p>
 *  在组件内部可以通过
 *  this.trigger(eventName, data);
 *  来开放一个事件
 *  这样在组件外部可以通过
 *  var module = new Module();
 *  module.bind(eventName, callback)
 *  来绑定事件，可以监听到内部的触发
 *
 *  base功能：
 *  1. 提供set和get方法，附带属性检查
 *  2. 提供自定义事件的支持
 *  3. 提供组件的生成函数
 *  4. 提供基础的初始化组件方法
 *
 *  @changeLog
 *  20120820 新增extend方法，支持对Base产生的对象进行二次继承
 *  Base.extend(moduleName, superModule, protoMethod, attrMember, staticMember)
 *  20120827
 *  修改ATTRS不存在的时候，option过滤的策略，如果传入的参数在ATTRS中没有对应的值，则不做过滤
 *  修改ATTRS.validator规范，validator只检查value为字符串或者数字的情况
 *  TODO:后续需要考虑这个策略是否完备
 */

(function ($) {

    /**
     * 用于对事件增加ATTR的支持，并提供一个ATT_CHANGE事件
     */

    function addAttr() {
        this.set = function (key, value) {
            var that = this,ret;
            ret = filterHandler(value, this.constructor.ATTRS[key], function(v){
                if(v === that.get(key)){
                    return false;
                }else{
                    that[key] = v;
                    that.trigger(ATTR_CHANGE, {
                        attrKey:key,
                        attrValue:value
                    });
                }
            });
        };
        this.get = function (key) {
            return this[key]
        }
    }

    var INIT = 'init',
        DESTROY = 'destroy',
        ATTR_CHANGE = 'attrChange',
        INITIALIZED = "initialized",
        DESTROYED = "destroyed";

    /**
     * 增加filter系统，用于对初始化时传入的option进行处理，只接受
     */
    function optionFilter(option, attrObj) {
        var ret = {};
        //如果option内的属性在attr中并没有对应的值，则直接将其传入
        $.each(attrObj, function(key,item){
            var value = option[key];
            filterHandler(value, item, function(v){
                ret[key] = v;
            });
        });
        //如果attr的属性在option中没有对应的值，则使用attr中的默认值
        $.each(option, function(key, item){
            filterHandler(item, attrObj[key], function(v){
                ret[key] = v;
            });
        });
        return ret;
    }

    /**
     * 判断item和value的匹配，给出正确的值
     * @param item
     * @param value
     * @param callback
     */

    function filterHandler(value, item, callback){
        if(!item) {
            callback(value);
            return false;
        }
        var v;
        if(value){
            if(itemFilter(value, item)){
                v = value;
            }else{
                return false;
            }
        }else{
            v = item['value'];
        }
        callback(v);
    }

    /**
     * 对单个属性进行filter，如果有setter则用setter过滤，否则就用validator
     * @param value
     * @param item
     * @return {*}
     */
    function itemFilter(value, item){
        if(item.setter){
            return item.setter(value)
        }else if(item.validator){
            return ~['string','number'].indexOf($.type(value)) ? item.validator.test(value) : false;
        }else{
            return true
        }
    }

    /**
     * 基础base对象，用于扩展
     * @constructor
     */
    function Base(option) {

        $.addCustomEvent.call(this);
        addAttr.call(this);

        this._init.apply(this, arguments);
    }

    Base.NAME = 'base';
    Base.classList = [];

    $.extend(Base.prototype, {
        /**
         * 静态属性，用于记录数据
         */
        initialized : false,
        destroyed : false,
        attrChangeHistory : [],
        /**
         * 生命周期内的方法
         */
        _init:function (option) {
            option = optionFilter(option,this.constructor.ATTRS);
            $.extend(this, option);
            this.bind(INIT, this._defInitFn);
            this.initializer && this.initializer(option);
            this.trigger(INIT);
            //绑定destroy对应的方法
            this.bind(DESTROY, this._defDestroyFn);
        },
        /**
         * 静态的默认属性，可以在子类中进行覆写
         */
        _defInitFn:function (e) {
            this.set(INITIALIZED, true);
            this.bind(ATTR_CHANGE, this._defAttrChange);
        },
        _defDestroyFn:function (e) {
            this.set(DESTROYED, true);
            this.destructor && this.destructor(arguments);
        },
        _defAttrChange:function (e) {
            this.attrChangeHistory.push(e);
            this[e.attrKey] = e.attrValue;
        }
    });

    /**
     * 用于构建新的模块，继承与base
     * @param moduleName 模块的名字
     * @param protoMethod 模块示例的方法
     * @param attrMember 模块的可配置属性
     * @param staticMember 模块的静态属性
     * @return {*} 返回模块本身
     * @private
     */

    Base._build = function(moduleName, superModule, protoMethod, attrMember, staticMember){
        //使用prototype方式继承
        var Module = function(option){
                //防止报错
                option = option || {};
                Module.superclass.constructor.call(this,option);
            },
            tempFn = function(){},
            o = {
                name : moduleName,
                value : Module
            };

        //模块名字
        Module.NAME = moduleName;
        /*Module.toString = function(){
            return moduleName;
        };*/
        //如果没有传入要继承的对象，则默认为Base
        superModule = superModule || Base;
        //挂载ATTRS属性
        //如果是继承于另外一个模块，则需要将ATTRS进行合并处理
        if(superModule.NAME !== 'base'){
            $.extend(attrMember, superModule.ATTRS);
        }
        Module.ATTRS = (attrMember || {});
        //挂在静态属性
        $.extend(Module, staticMember);
        //拷贝一份prototype，防止构造函数直接执行
        tempFn.prototype = superModule.prototype;
        Module.prototype = new tempFn();
        //把方法添加到Module的原型上
        $.extend(Module.prototype, protoMethod);
        //修改构造器
        Module.prototype.constructor = Module;
        //保存对超类的引用
        Module.superclass = superModule.prototype;
        if(superModule.prototype.constructor == Object.prototype.constructor){
            superModule.prototype.constructor = superModule;
        }
        //保存生成的对象
        Base.classList.push(o);
        return Module;
    };

    /**
     * build方法，用于创建一个继承与Base的模块
     * @param moduleName 模块的名字
     * @param protoMethod 挂载到模块原型上的方法
     * @param attrMember 模块参数的过滤系统
     * @param staticMember 挂载在模块本身上的静态数据
     * @return {*} 返回新构建的模块
     */
    Base.build = function(moduleName, protoMethod, attrMember, staticMember){
        return Base._build(moduleName, null, protoMethod, attrMember, staticMember)
    };

    /**
     * extend方法，可以创建一个模块，该模块可以继承与build出来的模块，也可以继承与Base，第二个在参数中可以指定
     * @param moduleName 模块的名字
     * @param superModule 用于继承的超类
     * @param protoMethod 挂载到模块原型上的方法
     * @param attrMember 模块参数的过滤系统
     * @param staticMember 挂载在模块本身上的静态数据
     * @return {*} 返回新构建的模块
     */
    Base.extend = function(moduleName, superModule, protoMethod, attrMember, staticMember){
        return Base._build(moduleName, superModule, protoMethod, attrMember, staticMember)
    };

    $.Base = Base;

})(Zepto);