# Pull To Refresh

Pull To Refresh下拉更新组件

-------

## 初始化

```javascript
var pull = new PullToRefresh({
    //下拉刷新的对象
    el: 'content',

    //下拉更新的提示
    textHelp: '下拉可以更新...',

    //开始加载的提示
    textLoading: '刷新中...',

    //下拉刷新成功的回调
    success: function(callback) {
        $.ajax({
            url: xxx,
            success: function(){
                ...
                callback();
            }
        })
    },

    //因为下拉距离不够失效的回调
    cancel: function() {
        alert('cancel');
    }
});
```

## 冻结

```javascript
pull.disable();
```

## 恢复

```javascript
pull.enable();
```

## 销毁

```javascript
pull.destroy();
```