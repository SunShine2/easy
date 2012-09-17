/**
 * 带动画的tab模块
 */

;(function($){
    $.AnimTab = $.Base.extend('ANIM_TAB', $.Tab, {
        hideItem : function(node){
            node.hide(300, function(){
                node.hide();
            });
        },
        showItem : function(node){
            node.show(300, function(){
                node.show();
            });
        }
    })
})(Zepto);