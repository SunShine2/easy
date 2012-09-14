/*
 * 日历模块
 * author : butian.wth@aliyun-inc.com
 * version : 0.0.1
 */

(function($){

  var CALENDAR_HTML = '<div class="calendar-wrap"><div class="calendar-hd"><div class="calendar-action"><span class="calendar-prev" _action="calPrev"><s></s></span><span class="calendar-year"></span>年<span class="calendar-month"></span>月<span class="calendar-next" _action="calNext"><s></s></span></div><div id="calendarInfo" class="calendar-info"></div></div><div class="calendar-box"></div></div>',
    CALENDAR_STYLE = '',
    Calendar;

  Calendar = function(container, year, month, options) {
    var now = new Date();
    //获取当前年月日
    this.curYear = now.getFullYear();
    this.curMonth = now.getMonth();//0-11
    this.curDay = now.getDate();//1-31
    this.curMonth < 10 || (this.curMonth = "0" + this.curMonth);
    this.curDay < 10 || (this.curDay = "0" + this.curDay);
    //如果参数中有年月，使用设置的时间
    if (year && month) {
      this.year = year;
      this.month = month - 1;
    } else {
      this.year = this.curYear;
      this.month = this.curMonth;
    }
    this.day = this.curDay;

    if (options) {
      for (var i in options) {
        this[i] = options[i];
      }
    }
    this.cont = $(container);
    this.json = null;
    //自动进行初始化
    this.init();
  };
  Calendar.prototype = {
    init : function() {
      var that = this;
      $(CALENDAR_HTML).appendTo(this.cont);
      setTimeout(function(){
        that.prevBtn = that.cont.find(".calendar-prev");
        that.nextBtn = that.cont.find(".calendar-next");
        that.box = that.cont.find(".calendar-box");
        that.calendarYear = that.cont.find(".calendar-year");
        that.calendarMonth = that.cont.find(".calendar-month");
        that.initEvent();
        that.show();
      },100);
    },
    initEvent : function(){
      var that = this;
    },
    //获取第一天是周几
    getWeek : function() {
      return new Date(this.year, parseInt(this.month), 1).getDay();
    },
    //获取当月有多少天
    getAllDay : function() {
      return new Date(this.year, parseInt(this.month) + 1, 0).getDate();
    },
    //生成月视图
    show : function() {
      var days = this.getAllDay(),html = [],wk = this.getWeek();
      var len = days + wk > 35 ? 42 : 35;
      html.push('<table><thead><tr><th>周日</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th></tr></thead><tbody><tr>');
      for (var i = 1; i <= len; i++) {
        //打印出日期
        if (i > wk && i <= (days + wk)) {
          var d = i - wk,
            m = parseInt(this.month) < 10 ? "0" + parseInt(this.month) : this.month + "";
          if (d < 10) d = "0" + d;
          //console.log(parseInt(this.curYear+this.curMonth+this.curDay),parseInt(this.year+ m+ d));
          if (d == this.curDay && this.curMonth == this.month && this.curYear == this.year) {
            html.push('<td class="active now" _action="ensure">' + d + '</td>');
          } else if (parseInt(this.curYear + this.curMonth + this.curDay) > parseInt(this.year + m + d)) {
            html.push('<td class="active before" _action="ensure">' + d + '</td>');
          } else {
            html.push('<td class="active" _action="ensure">' + d + '</td>');
          }
        } else {
          html.push('<td class="disabled">&nbsp;</td>');
        }
        if (i % 7 === 0 && i < len) {
          html.push("</tr><tr>");
        }
      }
      html.push('</tr></tbody></table>');
      this.box.html(html.join(" "));
      setTimeout(function(){
        datePage.initActionElements(datePage._self, datePage, ["div","li","span","td"]);
      }, 300);
      this.showStr();
    },
    //上月
    prev : function() {
      this.month = parseInt(this.month, 10);
      this.year = parseInt(this.year, 10);
      this.nextBtn.show();
      this.month--;
      if (this.month < 0) {
        this.month = 11;
        this.year--;
      }
      this.show();
    },
    next : function() {
      this.month = parseInt(this.month, 10);
      this.year = parseInt(this.year, 10);
      this.month++;
      if (this.month > 11) {
        this.month = 0;
        this.year++;
      }
      this.show();
    },
    //显示数字日期
    showStr : function() {
      this.calendarYear.html(this.year);
      this.calendarMonth.html(parseInt(this.month, 10) + 1);
    },
    getDate : function() {
      var m = parseInt(this.month, 10) + 1;
      if (m < 10) {
        m = "0" + m;
      }
      return this.year + "年" + m + "月";
    }
  };

  $.Calendar = Calendar;

})(Zepto);