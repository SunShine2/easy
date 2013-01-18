/**
 * 下拉刷新组件
 * @author: youxiao@alibaba-inc.com
 * @version: 1-0-0
 * @onlineVersion:
 */
;(function(){
    /**
     * @class PullToRefresh
     * @param options
     *      @param {String} [options.el] 下拉刷新的容器
     *      @param {String} [options.textHelp] 下拉刷新的提示
     *      @param {String} [options.textLoading] 刷新中的提示
     *      @param {Function} [options.success] 开始加载的回调，数据加载成功后，主动调用callback完成一次加载
     *
     *          {
     *              success: function(callback){
     *                  $.ajax({
     *                      url: xxx,
     *                      success: function(){
     *                          ...
     *                          callback();
     *                      }
     *                  })
     *              }
     *          }
     *
     *      @param {Function} [options.cancel] 下拉距离不够没有促发刷新的回调
     * @constructor
     */
    function PullToRefresh(options){
        var _this = this;
        this.el = document.getElementById(options.el);

        var cssText = 'line-height: 3em; text-align: center; margin-top: -3em;';

        this.refreshHelp = document.createElement('div');
        this.refreshHelp.className = 'refresh-help';
        this.refreshHelp.style.cssText = cssText;
        this.refreshHelp.innerText = (options.textHelp || '下拉可以刷新...');

        this.refreshLoading = document.createElement('div');
        this.refreshLoading.className = 'refresh-loading';
        this.refreshLoading.style.cssText = cssText + 'display:none';
        this.refreshLoading.innerHTML = '<img src="data:image/gif;base64,R0lGODlhEAAQAMQAAP%2F%2F%2F%2B7u7t3d3bu7u6qqqpmZmYiIiHd3d2ZmZlVVVURERDMzMyIiIhEREQARAAAAAP%2F%2F%2FwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2BQQFBwAQACwAAAAAEAAQAAAFdyAkQgGJJOWoQgIjBM8jkKsoPEzgyMGsCjPDw7ADpkQBxRDmSCRetpRA6Rj4kFBkgLC4IlUGhbNQIwXOYYWCXDufzYPDMaoKGBoKb886OjAKdgZAAgQkfCwzAgsDBAUCgl8jAQkHEAVkAoA1AgczlyIDczUDA2UhACH5BAUHABAALAAAAAAPABAAAAVjICSO0IGIATkqIiMKDaGKC8Q49jPMYsE0hQdrlABCGgvT45FKiRKQhWA0mPKGPAgBcTjsspBCAoH4gl%2BFmXNEUEBVAYHToJAVZK%2FXWoQQDAgBZioHaX8igigFKYYQVlkCjiMhACH5BAUHABAALAAAAAAQAA8AAAVgICSOUGGQqIiIChMESyo6CdQGdRqUENESI8FAdFgAFwqDISYwPB4CVSMnEhSej%2BFogNhtHyfRQFmIol5owmEta%2FfcKITB6y4choMBmk7yGgSAEAJ8JAVDgQFmKUCCZnwhACH5BAUHABAALAAAAAAQABAAAAViICSOYkGe4hFAiSImAwotB%2Bsi6Co2QxvjAYHIgBAqDoWCK2Bq6A40iA4yYMggNZKwGFgVCAQZotFwwJIF4QnxaC9IsZNgLtAJDKbraJCGzPVSIgEDXVNXA0JdgH6ChoCKKCEAIfkEBQcAEAAsAAAAABAADgAABUkgJI7QcZComIjPw6bs2kINLB5uW9Bo0gyQx8LkKgVHiccKVdyRlqjFSAApOKOtR810StVeU9RAmLqOxi0qRG3LptikAVQEh4UAACH5BAUHABAALAAAAAAQABAAAAVxICSO0DCQKBQQonGIh5AGB2sYkMHIqYAIN0EDRxoQZIaC6bAoMRSiwMAwCIwCggRkwRMJWKSAomBVCc5lUiGRUBjO6FSBwWggwijBooDCdiFfIlBRAlYBZQ0PWRANaSkED1oQYHgjDA8nM3kPfCmejiEAIfkEBQcAEAAsAAAAABAAEAAABWAgJI6QIJCoOIhFwabsSbiFAotGMEMKgZoB3cBUQIgURpFgmEI0EqjACYXwiYJBGAGBgGIDWsVicbiNEgSsGbKCIMCwA4IBCRgXt8bDACkvYQF6U1OADg8mDlaACQtwJCEAIfkEBQcAEAAsAAABABAADwAABV4gJEKCOAwiMa4Q2qIDwq4wiriBmItCCREHUsIwCgh2q8MiyEKODK7ZbHCoqqSjWGKI1d2kRp%2BRAWGyHg%2BDQUEmKliGx4HBKECIMwG61AgssAQPKA19EAxRKz4QCVIhACH5BAUHABAALAAAAAAQABAAAAVjICSOUBCQqHhCgiAOKyqcLVvEZOC2geGiK5NpQBAZCilgAYFMogo%2FJ0lgqEpHgoO2%2BGIMUL6p4vFojhQNg8rxWLgYBQJCASkwEKLC17hYFJtRIwwBfRAJDk4ObwsidEkrWkkhACH5BAUHABAALAAAAQAQAA8AAAVcICSOUGAGAqmKpjis6vmuqSrUxQyPhDEEtpUOgmgYETCCcrB4OBWwQsGHEhQatVFhB%2FmNAojFVsQgBhgKpSHRTRxEhGwhoRg0CCXYAkKHHPZCZRAKUERZMAYGMCEAIfkEBQcAEAAsAAABABAADwAABV0gJI4kFJToGAilwKLCST6PUcrB8A70844CXenwILRkIoYyBRk4BQlHo3FIOQmvAEGBMpYSop%2FIgPBCFpCqIuEsIESHgkgoJxwQAjSzwb1DClwwgQhgAVVMIgVyKCEAIfkECQcAEAAsAAAAABAAEAAABWQgJI5kSQ6NYK7Dw6xr8hCw%2BELC85hCIAq3Am0U6JUKjkHJNzIsFAqDqShQHRhY6bKqgvgGCZOSFDhAUiWCYQwJSxGHKqGAE%2F5EqIHBjOgyRQELCBB7EAQHfySDhGYQdDWGQyUhADs%3D"> '+(options.textLoading || '刷新中...');

        var children = this.el.children;
        this.el.insertBefore(this.refreshHelp, children[0]);
        this.el.insertBefore(this.refreshLoading, children[0]);

        var contentStartY,
            success,
            cancel,
            startY,
            track = false,
            refresh = false,
            loading = false;

        var removeTransition = function() {
            _this.el.style['-webkit-transition-duration'] = 0;
        };

        success = options.success;
        cancel = options.cancel;

        this._touchstart = function(e){
            if(_this.disabled || loading){
                return true;
            }
            e.preventDefault();
            contentStartY = _this.el.style.webkitTransform;
            contentStartY = contentStartY?contentStartY.match(/\d+/)[0]:0;
            startY = e.touches[0].screenY;
        };
        this.el.addEventListener('touchstart', this._touchstart);

        this._touchend = function(e){
            if(_this.disabled || loading){
                return true;
            }
            if(refresh) {
                loading = true;

                _this.el.style['-webkit-transition-duration'] = '.5s';
                _this.el.style['-webkit-transform'] = 'translateY(50px)';

                _this.refreshHelp.style.display = 'none';
                _this.refreshLoading.style.display = 'block';

                success(function() { // pass down done callback
                    loading = false;
                    _this.refreshHelp.style.display = 'block';
                    _this.refreshLoading.style.display = 'none';
                    _this.el.style['-webkit-transform'] = 'translateY(0)';
                    _this.el.addEventListener('transitionEnd', removeTransition);
                });

                refresh = false;
            } else if(track) {
                _this.el.style['-webkit-transition-duration'] = '.25s';
                _this.el.style['-webkit-transform'] = 'translateY(0)';
                _this.el.addEventListener('transitionEnd', removeTransition);

                cancel && cancel();
            }

            track = false;
        };
        this.el.addEventListener('touchend', this._touchend);

        this._touchmove = function(e){
            if(_this.disabled || loading){
                return true;
            }
            var d = startY - e.changedTouches[0].screenY;
            if(d > 0 || window.scrollY !== 0){
                return true;
            }

            var move_to = contentStartY - d / 2;
            // start tracking if near the top
            if(move_to > 0){
                track = true;
            }
            _this.el.style['-webkit-transform'] = 'translateY('+ move_to + 'px)';

            if(move_to > 100) {
                refresh = true;
            } else {
                _this.el.style['-webkit-transition'] = '';
                refresh = false;
            }
        };
        this.el.addEventListener('touchmove', this._touchmove);
    }
    PullToRefresh.prototype = {
        constructor: PullToRefresh,
        /**
         * 暂时使其失效
         * @method disable
         */
        disable: function(){
            this.disabled = true;
        },
        /**
         * 使其重新生效
         * @method ensable
         */
        ensable: function(){
            this.disabled = false;
        },
        /**
         * 销毁自己
         * @method destroy
         */
        destroy: function(){
            this.el.removeChild(this.refreshHelp);
            this.el.removeChild(this.refreshLoading);
            this.el.removeEventListener('touchstart', this._touchstart);
            this.el.removeEventListener('touchend', this._touchend);
            this.el.removeEventListener('touchmove', this._touchmove);
        }
    };
    window.PullToRefresh = PullToRefresh;
})();