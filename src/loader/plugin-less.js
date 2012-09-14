/*less插件*/
;(function($){
    $.plugin.add({
        rule : /\.less([\?#].*|$)/ig,
        exec:function(mod){
            var url = mod.path || mod;
            less.Parser.importer(url, [], function(e, tree) {
                createCSS(tree.toCSS(), url.replace(/[^\w]/g, '_'));
            }, {});
        }
    });
    
    function createCSS(cssText, id) {
        var elem = document.getElementById(id);
        if (elem) return;

        elem = document.createElement('style');
        elem.id = id;
        document.getElementsByTagName('head')[0].appendChild(elem);

        if (elem.styleSheet) { // IE
            elem.styleSheet.cssText = cssText
        } else { // W3C
            elem.appendChild(document.createTextNode(cssText))
        }
    }

})($E);
