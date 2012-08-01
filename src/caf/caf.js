/**
 * 针对云应用部分工具模块
 * author : butian.wth@aliyun-inc.com
 * version : 0-0-1
 */
(function($) {

  var caf,
    deviceFn = {
      "imei" : function(){return CloudAPI.Device.getDeviceId('getSimSuccess', 'getSimError')},
      "model" : function(){return navigator.system.platform.Model ? (navigator.system.platform.Model) : (getDevice("frameVer").split("."))[2]},
      "osInfo" : function(){return navigator.system.platform.NativeFrameworkVersion},
      "sysVer" : function(){return navigator.system.platform.FirmwareVersion},
      "frameVer" : function(){return navigator.system.platform.SystemFrameworkVersion},
      "uuid" : function(){
        var uuid = CloudAPI.PIM.getCloudUUID() != "false" ? CloudAPI.PIM.getCloudUUID() : "";
        //fuck uuid有可能偶尔取不到，多取几次
        while(!uuid) {
          uuid = CloudAPI.PIM.getCloudUUID() != "false" ? CloudAPI.PIM.getCloudUUID() : "";
        }
        return uuid;
      }
    };

  $.caf = {
    "imei" : "",
    "model" : "",
    "osInfo" : "",
    "sysVer" : "",
    "frameVer" : "",
    "uuid" : "",
    "screen" : ""
  };

  caf = $.caf;

  function getDevice(name){
    return caf.name ? caf.name : (function(){
        var ret = "";
        try{
          ret = deviceFn[name]();
        } catch(e){}
        caf.name = ret;
        return ret
      })();
  }

  $.getDevice = getDevice;

  $.extend({
    "getScreen" : function(callback) {
      var ret;
      navigator.system.get("OutputDevices", function(o) {
        window.screenInfo = o.displayDevices[0].physicalWidth + "*" + o.displayDevices[0].physicalHeight;
        ret = [o.displayDevices[0].physicalWidth, o.displayDevices[0].physicalHeight];
        callback(ret);
      });
    },
    "checkNet" : function(callback, agent) {
      if (CloudAPI.Device.DeviceStateInfo.isNetworkAvailable() !== "true") {
        var params = {
          "title": "联网提示",
          "msg"  : "网络连接失败，点击确定检查网络"
        };
        agent.dlgInvoke("confirm", this, params, this, function(dlg, act, sender){
          switch(act){
            case "dlg_ok":
              CloudAPI.Device.DeviceStateInfo.wirelessSetting();
              break;
            case "dlg_cancel":
            break;
          }
        });
      } else {
        callback.call(agent);
      }
    },
    "getApp" : function(){
      return __runtime__.getActiveApp()
    },
    "getPage" : function(){
      return $.getApp().getActivePage()
    },
    "getPageId" : function(){
      return $.getPage().getPid()
    },
    "pageBack" : function(){
      $.getApp()._deckPage.pageBack()
    },
    "launchApp" : function(type, name, data, sucCB, failCB){
      var l = navigator.service.applicationLauncher.launchApplication;
      if(name.indexOf("cloudappstore") != -1){
        l({
          "type": type,
          "id" : name,
          "data" : data
        }, sucCB, failCB)
      }else{
        l({
          "type":type,
          "package":name,
          "data":data
        }, sucCB, failCB)
      }
    },
    "getSign" : function(callback, agent, update){
      /**
       * 手机环境取真实的sign
       */
      agent = agent || $.getApp();
      var osToken = window.localStorage.getItem("os_token");
      if(osToken || !update){
        callback.call(agent);
        return osToken;
      }else{
        if(__runtime__.isMobile()){
          agent.sign = CloudAPI.PIM.peekSign();
          window.localStorage.setItem("os_token", agent.sign);
          if(agent.sign == "false"){
            agent.apiInvoke("sign", [true], agent, function(mysign) {
              if (mysign) {
                agent.sign = mysign;
                window.localStorage.setItem("os_token", agent.sign);
                callback && callback.call(agent, agent.sign);
                return mysign;
              } else {
                agent.showMsgBox("提示",'获取云帐号失败',"err");
                return false;
              }
            });
          }else{
            callback && callback.call(agent, agent.sign);
          }
        }else{
          /**
           * 开发环境取测试环境的sign
           */
          CloudAPI.PIM.getSign = function (flag, onSuccess, onFailure) {
            var url = "http://10.249.195.165/newopenapi/createsign.php?appid=60119&tyuid=zhouqicf";
            var win = window;
            __runtime__.getActiveApp().netInvoke("GET", url, "", "json", this, function (json) {
              if (json.code == 200) {
                _sign = json.data;
                  win[onSuccess](_sign);
              } else {
                win[onFailure]("PIM.getSign failure");
              }
            });
          };
          agent.apiInvoke("sign", [true], agent, function(mysign) {
            if (mysign) {
              agent.sign = mysign;
              window.localStorage.setItem("os_token", agent.sign);
              callback && callback.call(agent, mysign);
              return mysign;
            } else {
              agent.showMsgBox("提示",'获取云帐号失败',"err");
              return false;
            }
          });
        }
      }
    },
    "netInvokeSign" : function(method, url, params, type, agent, callback){
      if(!window.localStorage.getItem("os_token")){
        $.getSign(function(){
          this.netInvoke(method, url, params, type, agent, function(data){
            callback.call(agent,data);
          });
        }, this, true)
      }else{
        $.getApp().netInvoke(method, url, params, type, agent, function(data){
          if(data.code && data.code == "900"){
            $.getSign(function(){
              this.netInvoke(method, url, params, type, agent, function(data){
                callback.call(agent,data);
              });
            }, this, true)
          }else{
            callback.call(agent,data);
          }
        })
      }
    }
  });
})(Zepto);