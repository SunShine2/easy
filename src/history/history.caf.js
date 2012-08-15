/**
 * 依赖caf的history模块，用于在尽量不修改应用的前提下完成单页面刷新
 * author : zhangle.zl
 * version: 0-0-1
 */

(function ($) {

    var history = [];

    function _getLast() {
        var len = history.length,
            ret = false;
        if (len > 0) {
            ret = history[len - 1]
        }
        return ret
    }

    function _initHistory() {
        var sHistory = sessionStorage.getItem('appHistory');
        if (sHistory) {
            history = JSON.parse(sHistory)
        } else {
            history = []
        }
    }

    function _begin(option) {
        var last = _getLast(),
            filter = option.filter || [],
            ret = false;
        if (~filter.indexOf(last.pid)) {
            history = [];
        } else {
            this.unLogNavPage(last.pid, last.params);
            ret = true
        }
        return ret;
    }

    function _pushHistory(item){
        var len = history.length;
        if(item.pid !== (len -1 >= 0 ? history[len-1].pid : '')){
            history.push(item);
        }
        _saveHistory();
    }

    function _saveHistory(){
        if(history && history.length >= 0){
            sessionStorage.setItem('appHistory', JSON.stringify(history))
        }
    }

    function _popHistory(){
        var len = history.length;
        if(len > 0){
            history.pop();
            _saveHistory();
            return history[len-1]
        }
        return false
    }

    function AppHistory(option){
        _initHistory();
        _begin(option);
    }

    $.extend(AppHistory.prototype, {
        'initHistory':function (option) {
            _initHistory();
            _begin(option);
        },
        'getLastPage':_getLast,
        'push' : _pushHistory,
        'pop' : _popHistory
    })

})(Zepto);