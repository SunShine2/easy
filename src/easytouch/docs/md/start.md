# 开发第一个App

- summary: 如何使用EasyTouch创建一个App
- date: 2012-11-28
- tags: 

-------

## 结构

EasyTouch由`App`、`Page`、`Model`、`ModelList`和`View`5个部分组成，其中`App`和`Page`为核心部分，是一个应用必不可少的组成部分。`Model`、`ModelList`和`View`可以作为MVC的一部分独立于EasyTouch运行。

`App`是一个应用的抽象，用来控制应用的整体操作，如页面切换、父子应用通信、历史记录的控制等。所有`Page`存在于`App`的容器中，做为One Page One Application中的虚拟页面存在。

## 扩展一个`$.EasyTouch.App`类

```javascript
var App = $.EasyTouch.App.extend({
	//应用ID
    id: 'market',
    //应用容器
    container: '#app',
    //是否显示页面加载动画
    ifShowLoading: false,
    //默认页面切换动画
    defaultAnimation: 'slideRightIn',
    //应用包含的页面
    pages: {
       ...
    },
    //子应用
    apps: {
       'hongbao': 'http://cloudappfile.aliapp.com/prod/app_4/7184_b6b/hongbao/'
    },
    //绑定事件
    events: {
       'header': {
       		tap: 'tapHeader'
       	},
       '.back': {
       		tap: function(){
	       		...
	   		}
   		}
    },
    //应用初始化方法
    init: function(params){

	},
	//应用再次访问时执行的方法
	reset: function(params){

	},
	//任何你需要扩展的方法
    anyFunctions: function(){}
    ...
});
```

## 扩展一个`$.EasyTouch.Page`类

```javascript
var Page1 = $.EasyTouch.Page.extend({
	//页面片段的来源
    html: '#xxx .xxx',
    //绑定事件
    events: {
       ...
    },
    //页面初始化方法
    init: function(){},
    //页面再次访问时执行的方法
    reset: function(){},
    //每次页面切换动画完成后执行的方法，如果页面每次访问都需要做大量的DOM操作等高负荷计算，为了避免对页面切换动画的影响，建议在ready中执行
    ready: function(){},
    //任何你需要扩展的方法
    anyFunctions: function(){}
    ...
});
```

## 合起来

App初始化后跳转到Page1

```javascript
var Page1 = $.EasyTouch.Page.extend({
    html: 'xxx',
    init: function(){},
    reset: function(){}
   	...
});
var App = $.EasyTouch.extend({
    pages: {
       'Page1': Page1
    },
    init: function(){
    	this.navPage('Page1');
	}
    ...
});
new App();
```

## 构建一个基类

EasyTouch中任意一个模块都可以多次调用`extend`方法，为此你可以为你的应用构建一个基础的类，其他的类都基于这个基类，方便进行统一的处理

```javascript
var PageBase = $.EasyTouch.Page.extend({
	iScroll: function(id){
		var iscroll = new iScroll(id, {
			...
		});
	}
});
var Page1 = PageBase.extend({
	init: function(){
		this.iScroll('scroller');
	}
})
```

甚至可以重写构造函数`initializer`，在构造函数中执行统一的处理，这样在Page1初始化时，就可以自动执行一些方法了

```javascript
var PageBase = $.EasyTouch.Page.extend({
    initializer: function(){
    	//EasyTouch中任何类都可以在实例中通过`super`访问到原始的方法，重写内置方法时通过执行`super`上的方法，保证EasyTouch内部逻辑不会出错
        this.super.initializer.apply(this, arguments);

        //任何处理
    }
});
var Page1 = PageBase.extend({
	...
})
```