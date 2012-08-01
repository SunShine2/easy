/**
 * cache模块
 * version : 0-0-1
 * author : butian.wth@aliyun-inc.com
 * cache控制模块，用于将请求放入本地存储，尽量确保节省流量
 */

(function($){

  var localStorage = window.localStorage;

  var localCache = {
    idArr : [],
    "overdue" : 0,
    "storeData" : function( id, s){
      if(!(id in dataCont.idArr)){
        dataCont.idArr.push(id);
      }
      var ret = dataCont.preCovert(s);
      if(!ret){
        return false
      }else{
        try{
          localStorage.setItem(id,ret)
        }catch(e){
          console.error("本地存储溢出");
        }
      }
    },
    "preCovert" : function(data){
      if(typeof data == "object"){
        var o = {};
        o["time"] = Date.now();
        o["data"] = data;
        return JSON.stringify(o)
      }else if(typeof data == "function" || data == null){
        return false;
      }else if(typeof data == "string" && data.trim() == ""){
        return false;
      }
    },
    /**
     * 控制数据的缓存
     * @param id 请求的名字
     * @param agent 执行环境
     * @param callback 对应的回调函数
     * @param overdue 过期天数
     */
    "handleData" : function(id, agent, overdue, callback){
      /**
       * 解决历史问题，由于一开始一些数据没有被记入缓存
       */
      if(!(id in dataCont.idArr)){
        dataCont.idArr.push(id);
      }
      var dataInLocal = localStorage.getItem(id),
        time;
      overdue = overdue*24*60*60;
      dataInLocal = JSON.parse(dataInLocal);
      if(overdue != 0 && dataCont.checkDateAva(dataInLocal)){
        time = dataInLocal.time;
        if(dataCont.getDate(Date.now()) - dataCont.getDate(time) <= overdue){
          callback.call(agent, dataInLocal.data);
        }else{
          callback.call(agent,false)
        }
      }else{
        callback.call(agent,false)
      }
    },
    "checkDateAva" : function(o){
      return typeof o != "undefined" && o != "" && o != "null" && o != null
    },
    "getDate" : function(s){
      var date = new Date(s),
        y = date.getYear() + 1900,
        m = date.getMonth() +1,
        d = date.getDate();

      if(m<10) m = "0" + m;
      if(d<10) d = "0" +d;

      return  "" + y + m + d
    }
  };

  $.handleCache = localCache.handleData;

  $.cache = localCache.storeData;

})(Zepto);