# 安装

- summary: EasyTouch的资源加载介绍
- date: 2012-11-28
- tags: 

-------

## 加载依赖

EasyTouch依赖Easy框架的基础代码

```html
<!--Easy的reset.css-->
<link rel="stylesheet" href="http://wireless.aliyun-inc.com/easy/src/css/reset.css">
<!--EasyTouch的核心样式-->
<link rel="stylesheet" href="http://wireless.aliyun-inc.com/easy/src/easytouch/css/core.css">
<!--EasyTouch的所有动画样式，建议使用anim.less加载用到的样式-->
<link rel="stylesheet" href="http://wireless.aliyun-inc.com/easy/src/easytouch/css/anim.css">

<!--Easy框架基础脚本-->
<script src="http://wireless.aliyun-inc.com/easy/src/core/core.js"></script>
<script src="http://wireless.aliyun-inc.com/easy/lib/zepto/ajax.js"></script>
<script src="http://wireless.aliyun-inc.com/easy/src/core/event.js"></script>
<script src="http://wireless.aliyun-inc.com/easy/src/events/events.js"></script>
<script src="http://wireless.aliyun-inc.com/easy/src/base/base.js"></script>

<!--EasyTouch核心脚本-->
<script src="http://wireless.aliyun-inc.com/easy/src/easytouch/js/core.js"></script>
<!--EasyTouch Model、ModelList模块-->
<script src="http://wireless.aliyun-inc.com/easy/src/easytouch/js/model.js"></script>
<script src="http://wireless.aliyun-inc.com/easy/src/easytouch/js/modellist.js"></script>
<!--EasyTouch View模块-->
<script src="http://wireless.aliyun-inc.com/easy/src/easytouch/js/view.js"></script>
```

## 只加载用到的动画样式

在应用的less文件中加载`anim.less`文件，使用less的`mix`方法调用用到的动画

```css
/*加载import less文件，路径需要修改*/
@import "/easytouch/less/anim.less";

/*slideLeftIn、slideLeftOut、slideRightIn、slideRightOut对应的mix方法*/
.easytouch > .anim-slide();
```

所有动画列表

```css
.easytouch > .anim-slide();
.easytouch > .anim-slideV();
.easytouch > .anim-fade();
.easytouch > .anim-dissolve();
.easytouch > .anim-pop();
.easytouch > .anim-flip();
.easytouch > .anim-swap();
.easytouch > .anim-cube();
.easytouch > .anim-flow();
.easytouch > .anim-turn();
```