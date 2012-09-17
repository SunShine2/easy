/**
 * tab模块
 */
;(function($){

    var MODULE_NAME = 'TAB',
        TAB_LIST_CLASS = '.tab-list',
        TAB_CONT_CLASS = '.tab-cont',
        TAB_ITEM = '.tab-item',
        LI = 'li',
        CLICK = 'click',
        CURRENT = 'current',
        TAB_EVENT = 'tab',
        Tab = $.Base.build(MODULE_NAME, {
            initializer : function(option){
                this.container = option.container;
                this.curIndex = option.index || 0;
                this._initDOM();
                this._bindEvent();
            },
            _initDOM : function(){
                if(this.tabList = this.container.find(TAB_LIST_CLASS)){
                    this.tabItem = this.container.find(TAB_ITEM);
                }else{
                    //TODO:可以自己插入HTML片段来作为tab的结构
                }
                this.tabList.removeClass('current').eq(this.curIndex).addClass('current');
                this.tabItem.hide().eq(this.curIndex).show();
            },
            _bindEvent : function(){
                this._bindClick();
                this._bindTab();
            },
            _bindClick : function(){
                var that = this;
                this.tabList.delegate(LI, CLICK, function(e){
                    that.curIndex = $(this).index();
                    if(!~this.className.indexOf(CURRENT)){
                        $(this).addClass(CURRENT).siblings().removeClass(CURRENT);
                        that.trigger(TAB_EVENT);
                    }
                })
            },
            _bindTab : function(){
                this.bind(TAB_EVENT, function(){
                    var curItem = this.tabItem.eq(this.curIndex),
                        that = this;
                    console.log(curItem);
                    this.tabItem.each(function(){
                        that.hideItem($(this));
                    });
                    this.showItem(curItem)
                })
            },
            hideItem : function(node){
                node.hide();
            },
            showItem : function(node){
                node.show();
            }
        }, {
            container : {
                value : $(TAB_CONT_CLASS),
                setter : function(value){
                    return $(value);
                }
            }
        },{
            getModuleName : function(){
                return this.NAME;
            }
        });

    $.Tab = Tab;

})(Zepto);