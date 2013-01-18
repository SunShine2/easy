# Gallery组件

photoswipe的精简版本

-------

详细文档见：[http://www.photoswipe.com](http://www.photoswipe.com)

## 安装

```html
<link href="photoswipe.css" rel="stylesheet" />
<script src="code.photoswipe-3.0.5.js"></script>
```

## 初始化

```javascript
var myPhotoSwipe = Code.PhotoSwipe.attach( window.document.querySelectorAll('#Gallery a'), {
    enableMouseWheel: false ,
    enableKeyboard: false
});
```

```html
<ul id="Gallery">
	<li><a href="images/full/01.jpg"><img src="images/thumb/01.jpg" alt="Image 01" /></a></li>
	<li><a href="images/full/02.jpg"><img src="images/thumb/02.jpg" alt="Image 02" /></a></li>
	<li><a href="images/full/03.jpg"><img src="images/thumb/03.jpg" alt="Image 03" /></a></li>
	<li><a href="images/full/04.jpg"><img src="images/thumb/04.jpg" alt="Image 04" /></a></li>
	<li><a href="images/full/05.jpg"><img src="images/thumb/05.jpg" alt="Image 05" /></a></li>
	<li><a href="images/full/06.jpg"><img src="images/thumb/06.jpg" alt="Image 06" /></a></li>
</ul>
```
