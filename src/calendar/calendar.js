/*
 * 日历模块
 * author : butian.wth@aliyun-inc.com
 * version : 0-0-1
 */
(function($){

  var Calendar = function(y, m, options) {
    var _d = new Date();
    //获取当前年月日
    this.c_y = _d.getFullYear();
    this.c_m = _d.getMonth();//0-11
    this.c_d = _d.getDate();//1-31
    if (this.c_m < 10) this.c_m = "0" + this.c_m;
    if (this.c_d < 10) this.c_d = "0" + this.c_d;
    //如果参数中有年月，使用设置的时间
    if (y && m) {
      this.y = y;
      this.m = m - 1;
    } else {
      this.y = this.c_y;
      this.m = this.c_m;
    }
    this.d = this.c_d;
    if (options) {
      for (var i in options) {
        this[i] = options[i];
      }
    }
    this.elem = document.querySelector("#calendar");
    this.prevBtn = this.elem.querySelector(".cal_prev");
    this.nextBtn = this.elem.querySelector(".cal_next");
    this.box = this.elem.querySelector(".cal_box");
    this.cal_y = this.elem.querySelector(".cal_y");
    this.cal_m = this.elem.querySelector(".cal_m");
    this.json = null;
    this.pubTime = 0;//发布时间"2012-01-07"
  };
  Calendar.prototype = {
    init : function() {
      var self = this;
      this.prevBtn.onclick = function() {
        self.prev();
      };
      this.nextBtn.onclick = function() {
        self.next();
      };
      this.show();
    },
    //获取第一天是周几
    getWeek : function() {
      return new Date(this.y, parseInt(this.m), 1).getDay();
    },
    //获取当月有多少天
    getAllDay : function() {
      return new Date(this.y, parseInt(this.m) + 1, 0).getDate();
    },
    getData : function() {

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
            m = parseInt(this.m) < 10 ? "0" + parseInt(this.m) : this.m + "";
          if (d < 10) d = "0" + d;
          //console.log(parseInt(this.c_y+this.c_m+this.c_d),parseInt(this.y+ m+ d));
          if (d == this.c_d && this.c_m == this.m && this.c_y == this.y) {
            html.push('<td class="active now" _action="ensure">' + d + '</td>');
          } else if (parseInt(this.c_y + this.c_m + this.c_d) > parseInt(this.y + m + d)) {
            html.push('<td class="active before">' + d + '</td>');
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
      this.box.innerHTML = html.join(" ");
      this.showStr();
    },
    //上月
    prev : function() {
      this.m = parseInt(this.m, 10);
      this.y = parseInt(this.y, 10);
      this.nextBtn.style.display = "block";
      this.m--;
      if (this.m < 0) {
        this.m = 11;
        this.y--;
      }
      this.show();
    },
    next : function() {
      this.m = parseInt(this.m, 10);
      this.y = parseInt(this.y, 10);
      this.m++;
      if (this.m > 11) {
        this.m = 0;
        this.y++;
      }
      this.show();
    },
    //显示数字日期
    showStr : function() {
      this.cal_y.innerHTML = this.y;
      this.cal_m.innerHTML = parseInt(this.m, 10) + 1;
      //document.getElementById("d").innerHTML=this.d;
    },
    getDate : function() {
      console.log(this.m);
      var m = parseInt(this.m, 10) + 1;
      if (m < 10) {
        m = "0" + m;
      }
      return this.y + "年" + m + "月";
    }
  };

})(Zepto);