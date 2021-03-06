/**
 * 测试Zepto事件处理模块
 * @version : 0-0-1
 * @author : butian.wth
 * @changeLog
 * @20120830
 * 补充$.Base.connect方法相关的测试用例
 */

describe('测试Base模块', function () {

    var attrTest = {
            width:{
                value:5,
                validator:/\d/
            },
            height:{
                value:5,
                setter:function (value) {
                    return /\d/.test(value)
                }
            },
            name:{
                value:'wocalei',
                setter:function (value) {
                    return /.+/.test(value)
                },
                validator:/\d/
            }
        },
        nameA = 'a',
        msg = '这是静态属性',
        protoMethod = {
            initializer:function () {
                this.fucked = true;
            },
            getName:function () {
                this.trigger('getName', {nameState:'get'});
                return this.get('name');
            },
            getStaticName:function () {
                return $.Abc.NAME;
            },
            destructor:function () {
            }
        },
        nameB = 'b',
        attrTest01 = {
            top:{
                value:5,
                validator:/\d/
            },
            left:{
                value:5,
                setter:function (value) {
                    return /\d/.test(value)
                }
            },
            value:{
                value:'wolegequ',
                setter:function (value) {
                    return /.+/.test(value)
                },
                validator:/\d/
            }
        },
        protoMethod01 = {
            initializer:function () {
                this.fucked = false;
            },
            getName:function () {
                return this.get('value')
            },
            destructor:function () {
            }
        },
        msg01 = '静态参数BN';

    describe('测试build函数的功能', function () {
        describe('测试build生成模块的完整性', function () {
            $.Test = $.Base.build(nameA, protoMethod, attrTest, {
                MSG:msg
            });
            var obj1 = new $.Test();
            it('测试prototype上的方法是否已经挂载成功', function () {
                expect(obj1.getName()).toEqual('wocalei');
            });
            it('测试initializer上的方法是否已经执行成功', function () {
                expect(obj1.fucked).toEqual(true);
            });
            it('测试ATTR属性是否已经成功挂载', function () {
                expect($.Test.ATTRS).toEqual(attrTest)
            });
            it('测试NAME值是否成功挂载', function () {
                expect($.Test.NAME).toEqual(nameA);
            });
            it('测试静态属性是否成功挂载', function () {
                expect($.Test.MSG).toEqual(msg);
            })
        });
        describe('测试继承下来的方法是否完整', function () {
            $.Test01 = $.Base.build(nameA, protoMethod, attrTest, {
                MSG:msg
            });
            var obj1 = new $.Test01();
            it('测试initialized属性是否已经设置为true', function () {
                console.log(obj1);
                expect(obj1.initialized).toBeTruthy();
            });
            it('测试自定义事件方法是否已经挂载', function () {
                expect(obj1.bind).toBeTruthy();
                expect(obj1.trigger).toBeTruthy();
                expect(obj1.unbind).toBeTruthy();
            });
            it('测试ATTRS方法是否已经挂载', function () {
                expect(obj1.set).toBeTruthy();
                expect(obj1._set).toBeTruthy();
                expect(obj1.get).toBeTruthy();
                expect(obj1._get).toBeTruthy();
            });
            it('测试destroy方法是否正常', function () {
                obj1.trigger('destroy');
                expect(obj1.destroyed).toBeTruthy();
            })
        });
        describe('测试生成实例时参数的传递', function () {
            it('测试ATTRS参数为空的情况', function () {
                $.Test02 = $.Base.build(nameA, {
                    initializer:function () {
                        this.fucked = true;
                    }
                }, {}, {
                    MSG:msg
                });

                var objTest = new $.Test02({a:1});
                expect(objTest.get('a')).toEqual(1);
            });
            it('测试原型方法参数为空的情况', function () {
                $.Test03 = $.Base.build(nameA, {
                }, attrTest, {
                    MSG:msg
                });

                var objTest = new $.Test03();
                expect($.Test03.NAME).toEqual(nameA);
                expect(objTest.bind).toBeTruthy();
                expect($.Test03.MSG).toEqual(msg);
            });
            it('测试静态方法参数为空的情况', function () {
                $.Test04 = $.Base.build(nameA, {
                    initializer:function () {
                        this.fucked = true;
                    }
                }, attrTest, {
                });

                var objTest = new $.Test04();
                expect($.Test04.NAME).toEqual(nameA);
                expect(objTest.bind).toBeTruthy();
                expect($.Test04.MSG).not.toBeTruthy();
            });
            it('测试传入参数为空的情况', function () {
                $.Test05 = $.Base.build(nameA);
                var objTest = new $.Test05();
                expect($.Test05.NAME).toEqual(nameA);
                expect(objTest.bind).toBeTruthy();
                expect($.Test05.MSG).not.toBeTruthy();
            })
        });
        describe('测试ATTRS是否有效', function () {
            $.Test06 = $.Base.build(nameA, protoMethod, attrTest, {
                MSG:msg
            });
            var objTest = new $.Test06;
            it('测试不在ATTRS里的属性写入', function () {
                objTest.set('playing', true);
                expect(objTest.playing).toBeTruthy()
            });
            it('测试ATTR的validator检测没有通过的情况', function () {
                var v = 'px';
                objTest.set('width', v);
                expect(objTest.width).not.toEqual(v);
            });
            it('测试ATTR的setter没有检测通过的情况', function () {
                var v = 'px';
                objTest.set('height', v);
                expect(objTest.height).not.toEqual(v);
            });
            it('测试ATTR的validator检测通过的情况', function () {
                var v = '5px';
                objTest.set('width', v);
                expect(objTest.width).toEqual(v);
            });
            it('测试ATTR的setter检测通过的情况', function () {
                var v = '5px';
                objTest.set('height', v);
                expect(objTest.height).toEqual(v);
            });
            it('测试ATTR的setter检测通过的情况', function () {
                var v = '5px';
                objTest.set('height', v);
                expect(objTest.height).toEqual(v);
            });
        });
        describe('测试Base中事件相关的处理', function () {
            it('测试destroy事件的触发', function () {
                $.Test07 = $.Base.build(nameA, protoMethod, attrTest, {
                    MSG:msg
                });
                var objTest = new $.Test07,
                    name = 'a';
                objTest.bind('destroy', function () {
                    name = 'b';
                });
                objTest.trigger('destroy');
                expect(objTest.destroyed).toBeTruthy();
                expect(name).toEqual('b');
            });
            describe('测试ATTR中修改属性产生的处理', function () {
                $.Test08 = $.Base.build('attrChangeTest', {}, attrTest, {
                    MSG:msg
                });
                var objTest = new $.Test08,
                    o = {};
                objTest.bind('attrChange', function (e, attr) {
                    o.key = attr.attrKey;
                    o.value = attr.attrValue;
                });
                beforeEach(function () {
                    objTest.set('width', 5);
                    o = {};
                });
                it('测试修改成功时触发的处理', function () {
                    objTest.set('width', 1);
                    expect(o.key).toEqual('width');
                    expect(o.value).toEqual(1);
                });
                it('测试修改失败时触发的处理', function () {
                    objTest.set('width', {});
                    expect(o.key).not.toEqual('width');
                    expect(o.value).not.toEqual('px');
                });
            });
            describe('测试自定义事件的处理', function () {
                $.Test09 = $.Base.build('attrChangeTest', {
                    setValue:function () {
                        var a = 1;
                        this.trigger('initFinished', {value:1});
                    }
                }, attrTest, {
                    MSG:msg
                });
                var objTest = new $.Test09;
                it('测试在prototype方法中事件的触发', function () {
                    var value = 2;
                    objTest.bind('initFinished', function (e, data) {
                        value = data.value;
                    });
                    objTest.setValue();
                    expect(value).toEqual(1);
                })
            })
        });

        /**
         * @20120829 增加对应的测试
         */

        describe('测试setter方法的处理', function () {
            var Test = $.Base.build('abc', {}, {
                    number:{
                        setter:function (v) {
                            if ($.type(v) === 'string') {
                                v = parseInt(v, 10);
                            }
                            if ($.type(v) === 'number') {
                                return v;
                            }
                            return false;
                        }
                    }
                }, {
                    MSG:msg
                }),
                Test01 = $.Base.build('abc', {}, {
                    number:{
                        value:10,
                        setter:function (v) {
                            if ($.type(v) === 'string') {
                                v = parseInt(v, 10);
                            }
                            if ($.type(v) === 'number') {
                                return v;
                            }
                            return false;
                        }
                    }
                }, {
                    MSG:msg
                });

            it('测试不带默认value的逻辑', function () {
                var obj,
                    index;
                try {
                    obj = new Test({
                        number:[]
                    });
                } catch (e) {
                    index = 1;
                }
                expect(index).toEqual(1)
            });
            it('测试带默认value的逻辑', function () {
                var obj = new Test01({
                    number:[]
                });
                expect(obj.get('number')).toEqual(10)
            });
            it('测试setter对value的预处理', function () {
                var obj = new Test({
                        number:'11px'
                    }),
                    obj01 = new Test({
                        number:11
                    });
                expect(obj.number).toEqual(obj01.number);
            });
        })
    });

    describe('测试extend函数的功能', function () {
        $.Test10 = $.Base.build(nameA, protoMethod, attrTest, {
            MSG:msg
        });
        describe('测试extend生成模块的完整性', function () {
            $.Test11 = $.Base.extend(nameB, $.Test10, protoMethod01, attrTest01, {
                MSG:msg01
            });
            var obj1 = new $.Test11();
            it('测试prototype上的方法是否已经挂载成功', function () {
                expect(obj1.getName()).toEqual('wolegequ');
            });
            it('测试initializer上的方法是否已经执行成功', function () {
                expect(obj1.fucked).toEqual(false);
            });
            it('测试ATTR属性是否已经成功挂载', function () {
                expect($.Test11.ATTRS).toEqual(attrTest01)
            });
            it('测试NAME值是否成功挂载', function () {
                expect($.Test11.NAME).toEqual(nameB);
            });
            it('测试静态属性是否成功挂载', function () {
                expect($.Test11.MSG).toEqual(msg01);
            })
        });
        describe('测试继承下来的方法是否完整', function () {
            $.Test12 = $.Base.extend(nameB, $.Test10, protoMethod01, attrTest01, {
                MSG:msg
            });
            var obj1 = new $.Test12();
            it('测试initialized属性是否已经设置为true', function () {
                expect(obj1.initialized).toBeTruthy();
            });
            it('测试从父模块继承下来的方法是否生效', function () {
                expect(obj1.getStaticName).toBeTruthy();
            });
            it('测试自定义事件方法是否已经挂载', function () {
                expect(obj1.bind).toBeTruthy();
                expect(obj1.trigger).toBeTruthy();
                expect(obj1.unbind).toBeTruthy();
            });
            it('测试ATTRS方法是否已经挂载', function () {
                expect(obj1.set).toBeTruthy();
                expect(obj1.get).toBeTruthy();
            });
            it('测试destroy方法是否正常', function () {
                obj1.trigger('destroy');
                expect(obj1.destroyed).toBeTruthy();
            })
        });
        describe('测试生成实例时参数的传递', function () {
            it('测试ATTRS参数为空的情况', function () {
                $.Test13 = $.Base.extend(nameA, $.Test10, {
                    initializer:function () {
                        this.fucked = true;
                    }
                }, {}, {
                    MSG:msg
                });

                var objTest = new $.Test13({a:1});
                expect(objTest.get('a')).toEqual(1);
            });
            it('测试原型方法参数为空的情况', function () {
                $.Test14 = $.Base.extend(nameA, $.Test10, {
                }, attrTest, {
                    MSG:msg
                });

                var objTest = new $.Test14();
                expect($.Test14.NAME).toEqual(nameA);
                expect(objTest.bind).toBeTruthy();
                expect($.Test14.MSG).toEqual(msg);
            });
            it('测试静态方法参数为空的情况', function () {
                $.Test15 = $.Base.extend(nameA, $.Test10, {
                    initializer:function () {
                        this.fucked = true;
                    }
                }, attrTest, {
                });

                var objTest = new $.Test15();
                expect($.Test15.NAME).toEqual(nameA);
                expect(objTest.bind).toBeTruthy();
                expect($.Test15.MSG).not.toBeTruthy();
            });
            it('测试传入参数为空的情况', function () {
                $.Test16 = $.Base.extend(nameB);
                var objTest = new $.Test16();
                expect($.Test16.NAME).toEqual(nameB);
                expect(objTest.bind).toBeTruthy();
                expect($.Test16.MSG).not.toBeTruthy();
            })
        });
        describe('测试ATTRS是否有效', function () {
            $.Test17 = $.Base.extend(nameB, $.Test10, protoMethod01, attrTest01, {
                MSG:msg
            });
            var objTest = new $.Test17;
            it('测试不在ATTRS里的属性写入', function () {
                objTest.set('playing', true);
                expect(objTest.playing).toBeTruthy()
            });
            it('测试来自父类的ATTR的validator检测没有通过的情况', function () {
                var v = 'px';
                objTest.set('width', v);
                expect(objTest.width).not.toEqual(v);
            });
            it('测试ATTR的validator检测没有通过的情况', function () {
                var v = 'px';
                objTest.set('top', v);
                expect(objTest.top).not.toEqual(v);
            });
            it('测试来自父类的ATTR的setter没有检测通过的情况', function () {
                var v = 'px';
                objTest.set('left', v);
                expect(objTest.left).not.toEqual(v);
            });
            it('测试ATTR的setter没有检测通过的情况', function () {
                var v = 'px';
                objTest.set('height', v);
                expect(objTest.height).not.toEqual(v);
            });
            it('测试来自父类的ATTR的validator检测通过的情况', function () {
                var v = '5px';
                objTest.set('top', v);
                expect(objTest.top).toEqual(v);
            });
            it('测试ATTR的validator检测通过的情况', function () {
                var v = '5px';
                objTest.set('top', v);
                expect(objTest.top).toEqual(v);
            });
            it('测试来自父类的ATTR的setter检测通过的情况', function () {
                var v = '5px';
                objTest.set('height', v);
                expect(objTest.height).toEqual(v);
            });
            it('测试ATTR的setter检测通过的情况', function () {
                var v = '5px';
                objTest.set('value', v);
                expect(objTest.value).toEqual(v);
            });
        });
        describe('测试Base中事件相关的处理', function () {
            it('测试destroy事件的触发', function () {
                $.Test18 = $.Base.extend(nameB, $.Test10, protoMethod01, attrTest01, {
                    MSG:msg
                });
                var objTest = new $.Test18,
                    name = 'a';
                objTest.bind('destroy', function () {
                    name = 'b';
                });
                objTest.trigger('destroy');
                expect(objTest.destroyed).toBeTruthy();
                expect(name).toEqual('b');
            });
            describe('测试ATTR中修改属性产生的处理', function () {
                $.Test19 = $.Base.extend('attrChangeTest', $.Test10, {}, attrTest01, {
                    MSG:msg
                });
                var objTest = new $.Test19,
                    o = {};
                objTest.bind('attrChange', function (e, attr) {
                    //console.log(attr);
                    o.key = attr.attrKey;
                    o.value = attr.attrValue;
                });
                beforeEach(function () {
                    objTest.set('width', 5);
                    objTest.set('top', 5);
                    o = {}
                });
                it('测试修改父类属性成功时触发的处理', function () {
                    objTest.set('width', 1);
                    expect(o.key).toEqual('width');
                    expect(o.value).toEqual(1);
                });
                it('测试修改属性成功时触发的处理', function () {
                    objTest.set('top', 1);
                    expect(o.key).toEqual('top');
                    expect(o.value).toEqual(1);
                });
                it('测试修改父类属性失败时触发的处理', function () {
                    objTest.set('width', {});
                    expect(o.key).not.toEqual('width');
                    expect(o.value).not.toEqual('px');
                });
                it('测试修改属性失败时触发的处理', function () {
                    objTest.set('top', {});
                    expect(o.key).not.toEqual('top');
                    expect(o.value).not.toEqual('px');
                });
            });
            describe('测试自定义事件的处理', function () {
                $.Test20 = $.Base.extend('attrChangeTest', $.Test10, {
                    setValue:function () {
                        this.trigger('initFinished', {value:1});
                    }
                }, attrTest, {
                    MSG:msg
                });
                var objTest = new $.Test20;
                it('测试在父类prototype方法中事件的触发', function () {
                    var value = 2;
                    objTest.bind('getName', function (e, data) {
                        value = data.nameState;
                    });
                    objTest.getName();
                    expect(value).toEqual('get');
                });
                it('测试在prototype方法中事件的触发', function () {
                    var value = 2;
                    objTest.bind('initFinished', function (e, data) {
                        value = data.value;
                    });
                    objTest.setValue();
                    expect(value).toEqual(1);
                })
            })
        });
    });
    /**
     * @20120830 增加connect方法的测试用例
     */
    describe('测试connect方法的处理', function () {
        var ConnectTest, pm, sm,
            msg = 'asdas',
            superClass = $.Base,
            reset = function(){
                ConnectTest = function () {
                    ConnectTest.superclass.constructor.apply(this, arguments);
                };
                pm = {
                    initializer:function () {
                        this['fucked'] = true;
                    },
                    getIndex:function () {
                        return this.get('index');
                    }
                };
                sm = {
                    INDEX:2
                };
                ConnectTest.ATTRS = {
                    index:{
                        value:1
                    }
                };
            },
            obj1,
            objTest;
        reset();
        describe('测试继承于Base时的处理', function(){
            describe('测试connect生成模块的完整性', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, pm, sm);
                    obj1 = new ConnectTest({index:5});
                });
                it('测试prototype上的方法是否已经挂载成功', function () {
                    expect(obj1.getIndex()).toEqual(5);
                });
                it('测试initializer上的方法是否已经执行成功', function () {
                    expect(obj1.fucked).toEqual(true);
                });
                it('测试ATTR属性是否已经成功挂载', function () {
                    expect(ConnectTest.ATTRS).toEqual(attrTest)
                });
                it('测试静态属性是否成功挂载', function () {
                    expect(ConnectTest.INDEX).toEqual(sm.INDEX);
                })
            });
            describe('测试继承下来的方法是否完整', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, pm, sm);
                    obj1 = new ConnectTest();
                });
                it('测试initialized属性是否已经设置为true', function () {
                    expect(obj1.initialized).toBeTruthy();
                });
                it('测试自定义事件方法是否已经挂载', function () {
                    expect(obj1.bind).toBeTruthy();
                    expect(obj1.trigger).toBeTruthy();
                    expect(obj1.unbind).toBeTruthy();
                });
                it('测试ATTRS方法是否已经挂载', function () {
                    expect(obj1.set).toBeTruthy();
                    expect(obj1._set).toBeTruthy();
                    expect(obj1.get).toBeTruthy();
                    expect(obj1._get).toBeTruthy();
                });
                it('测试destroy方法是否正常', function () {
                    obj1.trigger('destroy');
                    expect(obj1.destroyed).toBeTruthy();
                })
            });
            describe('测试生成实例时参数的传递', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                });
                it('测试ATTRS参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        initializer:function () {
                            this.fucked = true;
                        }
                    }, {
                        MSG:msg
                    });

                    var objTest = new ConnectTest({a:1});
                    expect(objTest.get('a')).toEqual(1);
                });
                it('测试原型方法参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                    }, {
                        MSG:msg
                    });

                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).toEqual(msg);
                });
                it('测试静态方法参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        initializer:function () {
                            this.fucked = true;
                        }
                    }, {
                    });

                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).not.toBeTruthy();
                });
                it('测试传入参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass);
                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).not.toBeTruthy();
                })
            });
            describe('测试ATTRS是否有效', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, protoMethod, {
                        MSG:msg
                    });
                    objTest = new ConnectTest;
                });
                it('测试不在ATTRS里的属性写入', function () {
                    objTest.set('playing', true);
                    expect(objTest.playing).toBeTruthy()
                });
                it('测试ATTR的validator检测没有通过的情况', function () {
                    var v = 'px';
                    objTest.set('width', v);
                    expect(objTest.width).not.toEqual(v);
                });
                it('测试ATTR的setter没有检测通过的情况', function () {
                    var v = 'px';
                    objTest.set('height', v);
                    expect(objTest.height).not.toEqual(v);
                });
                it('测试ATTR的validator检测通过的情况', function () {
                    var v = '5px';
                    objTest.set('width', v);
                    expect(objTest.width).toEqual(v);
                });
                it('测试ATTR的setter检测通过的情况', function () {
                    var v = '5px';
                    objTest.set('height', v);
                    expect(objTest.height).toEqual(v);
                });
            });
            describe('测试事件相关的处理', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                });
                it('测试destroy事件的触发', function () {
                    $.Base.connect(ConnectTest, superClass, protoMethod, {
                        MSG:msg
                    });
                    var objTest = new ConnectTest,
                        name = 'a';
                    objTest.bind('destroy', function () {
                        name = 'b';
                    });
                    objTest.trigger('destroy');
                    expect(objTest.destroyed).toBeTruthy();
                    expect(name).toEqual('b');
                });
                describe('测试ATTR中修改属性产生的处理', function () {
                    var objTest,
                        o = {};
                    beforeEach(function () {
                        reset();
                        ConnectTest.ATTRS = attrTest;
                        $.Base.connect(ConnectTest, superClass, {}, {
                            MSG:msg
                        });
                        objTest = new ConnectTest;
                        objTest.set('width', 5);
                        o = {};
                        objTest.bind('attrChange', function (e, attr) {
                            o.key = attr.attrKey;
                            o.value = attr.attrValue;
                        });
                    });
                    it('测试修改成功时触发的处理', function () {
                        objTest.set('width', 1);
                        expect(o.key).toEqual('width');
                        expect(o.value).toEqual(1);
                    });
                    it('测试修改失败时触发的处理', function () {
                        objTest.set('width', {});
                        expect(o.key).not.toEqual('width');
                        expect(o.value).not.toEqual('px');
                    });
                });
                describe('测试自定义事件的处理', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        setValue:function () {
                            this.trigger('initFinished', {value:1});
                        }
                    }, attrTest, {
                        MSG:msg
                    });
                    var objTest = new ConnectTest;
                    it('测试在prototype方法中事件的触发', function () {
                        var value = 2;
                        objTest.bind('initFinished', function (e, data) {
                            value = data.value;
                        });
                        objTest.setValue();
                        expect(value).toEqual(1);
                    })
                })
            });
        });
        describe('测试继承于其他继承于Base模块时的处理', function(){
            superClass = $.Base.build(nameA, protoMethod, attrTest, {
                MSG:msg
            });
            describe('测试connect生成模块的完整性', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, pm, sm);
                    obj1 = new ConnectTest({index:5});
                });
                it('测试prototype上的方法是否已经挂载成功', function () {
                    expect(obj1.getIndex()).toEqual(5);
                });
                it('测试initializer上的方法是否已经执行成功', function () {
                    expect(obj1.fucked).toEqual(true);
                });
                it('测试静态属性是否成功挂载', function () {
                    expect(ConnectTest.INDEX).toEqual(sm.INDEX);
                })
            });
            describe('测试继承下来的方法是否完整', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, pm, sm);
                    obj1 = new ConnectTest();
                });
                it('测试initialized属性是否已经设置为true', function () {
                    expect(obj1.initialized).toBeTruthy();
                });
                it('测试自定义事件方法是否已经挂载', function () {
                    expect(obj1.bind).toBeTruthy();
                    expect(obj1.trigger).toBeTruthy();
                    expect(obj1.unbind).toBeTruthy();
                });
                it('测试ATTRS方法是否已经挂载', function () {
                    expect(obj1.set).toBeTruthy();
                    expect(obj1._set).toBeTruthy();
                    expect(obj1.get).toBeTruthy();
                    expect(obj1._get).toBeTruthy();
                });
                it('测试destroy方法是否正常', function () {
                    obj1.trigger('destroy');
                    expect(obj1.destroyed).toBeTruthy();
                })
            });
            describe('测试生成实例时参数的传递', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                });
                it('测试ATTRS参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        initializer:function () {
                            this.fucked = true;
                        }
                    }, {
                        MSG:msg
                    });

                    var objTest = new ConnectTest({a:1});
                    expect(objTest.get('a')).toEqual(1);
                });
                it('测试原型方法参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                    }, {
                        MSG:msg
                    });

                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).toEqual(msg);
                });
                it('测试静态方法参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        initializer:function () {
                            this.fucked = true;
                        }
                    }, {
                    });

                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).not.toBeTruthy();
                });
                it('测试传入参数为空的情况', function () {
                    $.Base.connect(ConnectTest, superClass);
                    var objTest = new ConnectTest();
                    expect(objTest.bind).toBeTruthy();
                    expect(ConnectTest.MSG).not.toBeTruthy();
                })
            });
            describe('测试ATTRS是否有效', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                    $.Base.connect(ConnectTest, superClass, protoMethod, {
                        MSG:msg
                    });
                    objTest = new ConnectTest;
                });
                it('测试不在ATTRS里的属性写入', function () {
                    objTest.set('playing', true);
                    expect(objTest.playing).toBeTruthy()
                });
                it('测试ATTR的validator检测没有通过的情况', function () {
                    var v = 'px';
                    objTest.set('width', v);
                    expect(objTest.width).not.toEqual(v);
                });
                it('测试ATTR的setter没有检测通过的情况', function () {
                    var v = 'px';
                    objTest.set('height', v);
                    expect(objTest.height).not.toEqual(v);
                });
                it('测试ATTR的validator检测通过的情况', function () {
                    var v = '5px';
                    objTest.set('width', v);
                    expect(objTest.width).toEqual(v);
                });
                it('测试ATTR的setter检测通过的情况', function () {
                    var v = '5px';
                    objTest.set('height', v);
                    expect(objTest.height).toEqual(v);
                });
            });
            describe('测试事件相关的处理', function () {
                beforeEach(function(){
                    reset();
                    ConnectTest.ATTRS = attrTest;
                });
                it('测试destroy事件的触发', function () {
                    $.Base.connect(ConnectTest, superClass, protoMethod, {
                        MSG:msg
                    });
                    var objTest = new ConnectTest,
                        name = 'a';
                    objTest.bind('destroy', function () {
                        name = 'b';
                    });
                    objTest.trigger('destroy');
                    expect(objTest.destroyed).toBeTruthy();
                    expect(name).toEqual('b');
                });
                describe('测试ATTR中修改属性产生的处理', function () {
                    var objTest,
                        o = {};
                    beforeEach(function () {
                        reset();
                        ConnectTest.ATTRS = attrTest;
                        $.Base.connect(ConnectTest, superClass, {}, {
                            MSG:msg
                        });
                        objTest = new ConnectTest;
                        objTest.set('width', 5);
                        o = {};
                        objTest.bind('attrChange', function (e, attr) {
                            o.key = attr.attrKey;
                            o.value = attr.attrValue;
                        });
                    });
                    it('测试修改成功时触发的处理', function () {
                        objTest.set('width', 1);
                        expect(o.key).toEqual('width');
                        expect(o.value).toEqual(1);
                    });
                    it('测试修改失败时触发的处理', function () {
                        objTest.set('width', {});
                        expect(o.key).not.toEqual('width');
                        expect(o.value).not.toEqual('px');
                    });
                });
                describe('测试自定义事件的处理', function () {
                    $.Base.connect(ConnectTest, superClass, {
                        setValue:function () {
                            this.trigger('initFinished', {value:1});
                        }
                    }, attrTest, {
                        MSG:msg
                    });
                    var objTest = new ConnectTest;
                    it('测试在prototype方法中事件的触发', function () {
                        var value = 2;
                        objTest.bind('initFinished', function (e, data) {
                            value = data.value;
                        });
                        objTest.setValue();
                        expect(value).toEqual(1);
                    })
                })
            });
        });
    });
});