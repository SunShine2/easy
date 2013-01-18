# Pull To Refresh

依赖iScroll的Pull To Refresh组件

-------

## 初始化

```javascript
var pull = new PullToRefresh({
    //iScroll的容器ID
    id: 'content',

    //下拉刷新的提示
    pullDownLabelPull: 'Pull down to refresh...',
    //上拉加载的提示
    pullUpLabelPull: 'Pull up to load more...',
    //下拉后松开进行刷新的提示
    pullDownLabelRelease: 'Release to refresh...',
    //上拉后松开进行加载的提示
    pullUpLabelRelease: 'Release to load more...',
    //下拉刷新后开始加载的提示
    pullDownLabelLoading: 'Loading...',
    //上拉后开始加载的提示
    pullUpLabelLoading: 'Loading...',

    //下拉刷新的生效距离
    offset: 100,

    //上拉加载的Action
    pullUpAction: function(callback){
        $.ajax({
            url: xxx,
            success: function(){
                ...
                callback();
            }
        })
    },
    //下拉更新的Action
    pullDownAction: function(callback){
        $.ajax({
            url: xxx,
            success: function(){
                ...
                callback();
            }
        })
    }
});
```

## 销毁

```javascript
pull.destroy();
```

## iscroll引用

```javascript
this.iscroll
```