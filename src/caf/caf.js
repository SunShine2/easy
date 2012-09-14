/**
 * 针对云应用部分工具模块
 * author : butian.wth@aliyun-inc.com
 * version : 0.0.2
 */
(function ($) {

    var caf,
        deviceFn = {
            "imei":function () {
                return CloudAPI.Device.getDeviceId('getSimSuccess', 'getSimError')
            },
            "model":function () {
                return navigator.system.platform.Model ? (navigator.system.platform.Model) : (getDevice("frameVer").split("."))[2]
            },
            "osInfo":function () {
                return navigator.system.platform.NativeFrameworkVersion
            },
            "sysVer":function () {
                return navigator.system.platform.FirmwareVersion
            },
            "frameVer":function () {
                return navigator.system.platform.SystemFrameworkVersion
            },
            "uuid":function () {
                var uuid = CloudAPI.PIM.getCloudUUID() != "false" ? CloudAPI.PIM.getCloudUUID() : "";
                //fuck uuid有可能偶尔取不到，多取几次
                while (!uuid) {
                    uuid = CloudAPI.PIM.getCloudUUID() != "false" ? CloudAPI.PIM.getCloudUUID() : "";
                }
                return uuid;
            }
        };

    $.caf = {
        "imei":"",
        "model":"",
        "osInfo":"",
        "sysVer":"",
        "frameVer":"",
        "uuid":""
    };

    caf = $.caf;

    function getDevice(name) {
        return caf[name] ? caf[name] : (function () {
            var ret = "";
            try {
                ret = deviceFn[name]();
            } catch (e) {
            }
            caf[name] = ret;
            return ret
        })();
    }

    $.getDevice = getDevice;

    $.extend($, {
        "getScreen":function (callback) {
            var ret;
            navigator.system.get("OutputDevices", function (o) {
                window.screenInfo = o.displayDevices[0].physicalWidth + "*" + o.displayDevices[0].physicalHeight;
                ret = [o.displayDevices[0].physicalWidth, o.displayDevices[0].physicalHeight];
                callback(ret);
            });
        },
        "checkNet":function (callback, agent, failHandler) {
            console.log(agent);
            agent = typeof agent !== "undefined" ? agent : this;
            agent.checkNeting = false;
            if ('true' !== CloudAPI.Device.DeviceStateInfo.isNetworkAvailable()) {
                if(failHandler){
                    failHandler.call(agent);
                }else{
                    $.defaultNetError(agent);
                }
            } else {
                agent.checkNeting = false;
                callback && callback.call(agent);
            }
        },
        'defaultNetError' : function(agent){
            var msg,
                params;
            if (agent.checkNeting) {
                msg = "您刚刚设置过网络，可能还没连接成功,您可以尝试重新连接。"
            } else {
                msg = "系统检测到您没有使用网络，是否要设置网络？"
            }
            params = {
                "title":"提示",
                "msg":msg
            };
            agent.dlgInvoke("neterror", agent, params, agent, function (a, b) {
                if ('dlg_cancel' !== b) {
                    agent.checkNeting = true;
                    CloudAPI.Device.DeviceStateInfo.wirelessSetting();
                }
            });
            $.loading && $.loading.hide()
        },
        "getApp":function () {
            return __runtime__.getActiveApp()
        },
        "getPage":function () {
            return $.getApp().getActivePage()
        },
        "getPageId":function () {
            return $.getPage().getPid()
        },
        "setPageBack":function (callback) {
            $.getApp()._deckPage.pageBack = callback
        },
        "launchApp":function (type, name, data, sucCB, failCB) {
            var l = navigator.service.applicationLauncher.launchApplication;
            if (name.indexOf("cloudappstore") != -1) {
                l({
                    "type":type,
                    "id":name,
                    "data":data
                }, sucCB, failCB)
            } else {
                l({
                    "type":type,
                    "package":name,
                    "data":data
                }, sucCB, failCB)
            }
        },
        "getSign":function (callback, agent, update) {
            /**
             * 手机环境取真实的sign
             */

            /**
             * 开发环境取测试环境的sign
             */

            agent = agent || $.getApp();
            var osToken = $.os_token;
            if (osToken || !update) {
                callback.call(agent);
                return true;
            } else {
                $.os_token = CloudAPI.PIM.peekSign();
                if ($.os_token == "false") {
                    agent.apiInvoke("sign", [true], agent, function (mysign) {
                        if (mysign) {
                            $.os_token = mysign;
                            callback && callback.call(agent, agent.sign);
                            return mysign;
                        } else {
                            agent.showMsgBox("提示", '获取云帐号失败', "err");
                            return false;
                        }
                    });
                } else {
                    if (!__runtime__.isMobile()) {
                        $.os_token = '';
                    }
                    callback && callback.call(agent, $.os_token);
                }
                Loading.hide();
            }

            /**
             * 划开的时候清除sign
             */
            agent.onSuspend = function () {
                $.os_token = "";
            };
        },
        "netInvokeSign":function (method, url, params, type, agent, callback) {
            if (!$.os_token) {
                $.getSign(function () {
                    params["sign"] = $.os_token;
                    $.getApp().netInvoke(method, url, params, type, agent, function (data) {
                        callback.call(agent, data);
                    });
                }, this, true)
            } else {
                $.getApp().netInvoke(method, url, params, type, agent, function (data) {
                    if (data.code && data.code == "900") {
                        $.getSign(function () {
                            $.getApp().netInvoke(method, url, params, type, agent, function (data) {
                                callback.call(agent, data);
                            });
                        }, this, true)
                    } else {
                        callback.call(agent, data);
                    }
                })
            }
        },
        "checkData":function (data, flag, callback, list, agent) {
            agent = typeof agent !== "undefined" ? agent : this;
            if (flag) {
                if (list &&( list == null || list.length === 0 )) {
                    agent.toast ? agent.toast("您的试用列表为空") : agent._app.toast("您的试用列表为空");
                }
                callback.call(agent, data);

            } else {
                //agent.showMsgBox("提示", "网络繁忙，请重试或检查网络", "warn");
            }
            Loading.hide();
        },
        "comparePlain":function (actual, expect) {
            var e = JSON.stringify(expect),
                a = JSON.stringify(actual);

            return e === a;
        },
        'formatedDate':function (connect, dateObj) {
            var now = [],
                date = dateObj || new Date();
            now.push(date.getFullYear());
            now.push(date.getMonth() + 1);
            now.push(date.getDate());
            if (now[1] < 10) {
                now[1] = "0" + now[1];
            }
            if (now[2] + 1 < 10) {
                now[2] = "0" + now[2];
            }
            return now.join(connect);
        }
    });
})(Zepto);