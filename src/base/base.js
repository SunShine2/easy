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
 *  @20120820
 *  1. 新增extend方法，支持对Base产生的对象进行二次继承
 *  Base.extend(moduleName, superModule, prototypeMethod, attrMember, staticMember)
 *  @20120827
 *  1. 修改ATTRS不存在的时候，option过滤的策略，如果传入的参数在ATTRS中没有对应的值，则不做过滤
 *  2. 修改ATTRS.validator规范，validator只检查value为字符串或者数字的情况
 *  3. 修正进行两次属性写入的问题
 *  TODO:后续需要考虑这个策略是否完备
 *  @20120829
 *  1. 如果ATTRS中不含有value属性，则认为该属性为必须的属性，直接抛出一个错误
 *  2. 对setter方法进行扩充，可以在setter中对传入的参数进行处理，让模块内部接收到一个稳定的值
 *  @20120830
 *  1. 增加connect方法，支持对现有存在的构造函数进行继承关系处理
 *  2. 构造函数不指定option，使用arguments进行传递
 *  3. 对Base._build方法进行包装
 *  4. 对模块增加_instances属性，保存对所有实例的引用
 *  5. 增加_set和_get方法，用于直接操作模块属性，不触发ATTR_CHANGE事件
 *  6. 修复构造函数自带ATTRS时对应的处理方式，从直接赋值修改为合并
 */
define('base',['core'],function(require, exports, module){
    var $ = require('core');
    /**
     * Attribute集合
     */
    /**
     * 用于对事件增加ATTR的支持，并提供一个ATT_CHANGE事件
     */

    function addAttr() {
        this.set = function (key, value) {
            var that = this;
            filterHandler(value, this.constructor.ATTRS[key], function (v) {
                if (v === that.get(key)) {
                    return false;
                } else {
                    that.trigger(ATTR_CHANGE, {
                        attrKey:key,
                        attrValue:value
                    });
                }
            });
        };
        this.get = function (key) {
            return this._get(key)
        };
        this._set = function(key, value){
            this[key] = value;
        };
        this._get = function (key) {
            return this[key]
        };
    }

    var INIT = 'init',
        DESTROY = 'destroy',
        ATTR_CHANGE = 'attrChange',
        BASE = 'base',
        BOOLEAN = 'boolean',
        FILTER_ERROR_MSG = '[Base filterHandler]：a suitable value required',
        STRING = 'string',
        NUMBER = 'number',
        INITIALIZED = 'initialized',
        DESTROYED = 'destroyed';

    /**
     * 增加filter系统，用于对初始化时传入的option进行处理
     * @param option
     * @param attrObj
     * @return {Object}
     */
    function optionFilter(option, attrObj) {
        var ret = {};
        //如果option内的属性在attr中并没有对应的值，则直接将其传入
        $.each(attrObj, function (key, item) {
            var value = option[key];
            filterHandler(value, item, function (v) {
                ret[key] = v;
            });
        });
        //如果attr的属性在option中没有对应的值，则使用attr中的默认值
        $.each(option, function (key, item) {
            filterHandler(item, attrObj[key], function (v) {
                ret[key] = v;
            });
        });
        return ret;
    }

    /**
     * 判断item和value的匹配，给出正确的值
     */

    function filterHandler(value, item, callback) {
        if (!item) {
            callback(value);
            return false;
        }
        var v,
            ret;
        if (value) {
            ret = itemFilter(value, item);
            //如果返回的是boolean类型且值为true，则用true和false来判断是否setter通过
            if ($.type(ret) === BOOLEAN && ret) {
                v = value;
            } else if (ret) { //如果返回的值非boolean类型，而且非undefined/null，则表示是经过setter处理后的值
                v = ret;
            }
        }
        if (!ret || !value) {
            //如果ATTRS中含有value属性，则默认采用value
            //如果不含value属性，则意味着这个属性是必须指定的
            if ('value' in item) {
                v = item.value;
            } else {
                throw new Error(FILTER_ERROR_MSG);
            }
        }
        return callback(v);
    }

    /**
     * 对单个属性进行filter，如果有setter则用setter过滤并处理，否则就用validator
     * @param value
     * @param item
     * @return {*}
     */
    function itemFilter(value, item) {
        if (item.setter) {
            return item.setter(value)
        } else if (item.validator) {
            return ~[STRING, NUMBER].indexOf($.type(value)) ? item.validator.test(value) : false;
        } else {
            return true
        }
    }

    /**
     * 基础base对象，用于扩展
     * @constructor
     */
    function Base() {

        $.addCustomEvent.call(this);
        addAttr.call(this);

        this._init.apply(this, arguments);
    }

    Base.NAME = BASE;
    Base.classList = [];

    $.extend(Base.prototype, {
        /**
         * 静态属性，用于记录数据
         */
        initialized:false,
        destroyed:false,
        attrChangeHistory:[],
        /**
         * 生命周期内的方法
         */
        _init:function (option) {
            option = optionFilter(option || {}, this.constructor.ATTRS);
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
        _defInitFn:function () {
            this._set(INITIALIZED, true);
            this.bind(ATTR_CHANGE, this._defAttrChange);
        },
        _defDestroyFn:function () {
            this._set(DESTROYED, true);
            this.destructor && this.destructor(arguments);
        },
        _defAttrChange:function (e, data) {
            this.attrChangeHistory.push({
                event:e,
                data:data
            });
            this[data.attrKey] = data.attrValue;
        }
    });

    /**
     * 用于构建新的模块，继承与base
     * @param moduleName 模块的名字
     * @param prototypeMethod 模块示例的方法
     * @param attrMember 模块的可配置属性
     * @param staticMember 模块的静态属性
     * @return {*} 返回模块本身
     * @private
     */

    Base._build = function (moduleName, superModule, prototypeMethod, attrMember, staticMember, curConstructor) {
        //使用prototype方式继承
        var Module = function () {
            Module.superclass.constructor.apply(this, arguments);
            //保存对实例的引用
            Module._instances[$.zid(this)] = this;
        };
        if(curConstructor){
            Module = curConstructor;
        }
        //如果给定了构造函数，就在给定的构造函数上进行扩展，否则试用默认的构造函数
        return Base._handlerClass(moduleName, Module, superModule, prototypeMethod, attrMember, staticMember)
    };

    /**
     * 对模块进行包装
     * @param moduleName
     * @param module
     * @param superModule
     * @param prototypeMethod
     * @param attrMember
     * @param staticMember
     * @return {*}
     * @private
     */
    Base._handlerClass = function (moduleName, module, superModule, prototypeMethod, attrMember, staticMember) {
        var tempFn = function () {
            },
            o = {
                name:moduleName,
                value:module
            };
        //创建对象来保存实例的引用
        module._instances = {};
        //模块NAME
        if (moduleName) {
            module.NAME = moduleName;
        }
        /*Module.toString = function(){
         return moduleName;
         };*/
        //如果没有传入要继承的对象，则默认为Base
        superModule = superModule || Base;
        attrMember = attrMember || {};
        staticMember = staticMember || {};
        prototypeMethod = prototypeMethod || {};
        //挂载ATTRS属性
        //如果是继承于另外一个模块，则需要将ATTRS进行合并处理
        if (superModule.NAME !== BASE) {
            $.extend(attrMember, superModule.ATTRS);
        }
        //@20120830修复构造函数自带ATTRS时对应的处理方式
        module.ATTRS = module.ATTRS || {};
        $.extend(module.ATTRS, attrMember);
        //挂在静态属性
        $.extend(module, staticMember);
        //拷贝一份prototype，防止构造函数直接执行
        tempFn.prototype = superModule.prototype;
        module.prototype = new tempFn();
        //把方法添加到Module的原型上
        $.extend(module.prototype, prototypeMethod);
        //修改构造器，防止回溯失败
        module.prototype.constructor = module;
        //保存对超类的引用
        module.superclass = superModule.prototype;
        if (superModule.prototype.constructor == Object.prototype.constructor) {
            superModule.prototype.constructor = superModule;
        }

        //保存生成的对象
        Base.classList.push(o);

        return module;
    };

    /**
     * build方法，用于创建一个继承与Base的模块
     * @param {string} moduleName 模块的名字
     * @param {object} prototypeMethod 挂载到模块原型上的方法
     * @param {object} attrMember 模块参数的过滤系统
     * @param {object} staticMember 挂载在模块本身上的静态数据
     * @return {*} 返回新构建的模块
     */
    Base.build = function (moduleName, prototypeMethod, attrMember, staticMember) {
        return Base._build(moduleName, null, prototypeMethod, attrMember, staticMember)
    };

    /**
     * extend方法，可以创建一个模块，该模块可以继承与build出来的模块，也可以继承与Base，第二个在参数中可以指定
     * @param {string} moduleName 模块的名字
     * @param {object} superModule 用于继承的超类
     * @param {object} prototypeMethod 挂载到模块原型上的方法
     * @param {object} attrMember 模块参数的过滤系统
     * @param {object} staticMember 挂载在模块本身上的静态数据
     * @return {*} 返回新构建的模块
     */
    Base.extend = function (moduleName, superModule, prototypeMethod, attrMember, staticMember) {
        return Base._build(moduleName, superModule, prototypeMethod, attrMember, staticMember)
    };

    /**
     * connect方法，可以让一个给定的构造函数继承超类的方法
     * @param {object} curConstructor 构造函数
     * @param {object} superModule 用于继承的超类
     * @param {object} prototypeMethod 挂载到模块原型上的方法，优先级最高，所以需要独立作为参数
     * @param {object} staticMember 挂载在模块本身上的静态数据
     * @return {*} 返回新构建的模块
     */

    Base.connect = function (curConstructor, superModule, prototypeMethod, staticMember) {
        return Base._build(null, superModule, prototypeMethod, null, staticMember, curConstructor);
    };

    module.exports = $;
});