;(function(){
    var root = 'http://app.windcache.com/';

    window.Model = $.EasyTouch.Model.extend({
        parseAjaxOptions: function(options){
            options.url = root + options.url;
            options.data = options.data || {};
            options.data.sign = 'MzNlOWE1Nzc1N2NiZDcxYWRmMWFhYjRiOTlkM2YxNDc1NGY3YjA4Nzp6aG91cWljZjo2MDExOTo3ODYxOWE3ZmJmOGNlNjZmZTFmYTcwOGRkZjJlYmNjYzoxMzUxNjgyNjgz';
            return options;
        },
        validate: function(data){
            return data.code === 200 || data.success;
        }
    });
})();