# DateSource

用于获取数据，并自动缓存到本地。DataSource在组件内部可以缓存ajax请求数据，下次请求的时候，如果由于网络
情况导致获取失败，可以自动使用localStorage中的数据。


## 配置
+ name			name是必须的一个参数，并且要保证其唯一性，组件会根据它作前缀保存数据到localStorage中
+ 请求key		除去name之后的任意字符串
    - url		server端URL
    - method		ajax method
    - data		ajax参数，可以是一个function
    - cachable		是否缓存ajax响应，默认true
    - netFunction	判断网络是否可以，可选
    - ajax		自定义ajax发送方式，可选

## 方法

+ fetch(key, callback); 获取数据
	
		var datasource = new $.DataSource({
		    name: 'ds',
		    getName: {
			url: 'getName.php
		    }
		});
		datasource.fetch('getName', function(e, data){
		});

+ updateCache(key); 更新缓存
	
		var datasource = new $.DataSource({
		    name: 'ds',
		    //总是从本地读取数据
		    order: ['Local']
		    getName: {
			url: 'getName.php
		    }
		});
		datasource.fetch('getName', function(e, data){
		    if(e){ return }
		    //手动从服务器更新
		    datasource.updateCache('getName');
		});

+ clearItem(key); 清除缓存
	
		var datasource = new $.DataSource({
		    name: 'ds',
		    //优先从本地读取数据
		    order: ['Local', 'Remote']
		    getName: {
			url: 'getName.php
		    }
		});
		//pause事件之后移除某个缓存
		document.addEventListener('pause', function(){
		    datasource.clearItem('getName');
		}, false);

## Examples
	
	//定义一个数据源
	var datasource = new $.DataSource({
	    name: 'datasource_uuid',
	    getData: {
			url: '/getData.php'
	    }
	});

	datasource.fetch('getData', function(e, data){
	    if(!e){
			console.log(data);
	    }
	});

	//优先从localStorage中读取数据
	var datasource = new $.DataSource({
		    name: 'datasource_uuid',
		    order: ['Remote', 'Local'],
		    getData: {
			url: '/getData.php'
	    }
	});
	datasource.fetch('getData', function(e, data){
	    if(!e){
			console.log(data);
	    }
	});
	
	//设置缓存过期时间
	var datasource = new $.DataSource({
	    name: 'datasource_uuid',
	    order: ['Remote', 'Local'],
	    getData: {
			url: '/getData.php',
			expiredTime: 1000 * 60 * 60 //一小时过期
	    }
	});
	datasource.fetch('getData', function(e, data){
	    if(!e){
			console.log(data);
	    }
	});

	//order表示数据源的查找顺序，比如想拿到当前的时间戳，首先去服务器去取，如果失败，再使用客户端时间。
	var datasource = new $.DataSource({
	    name: 'datasource_uuid',
	    order: ['Remote', 'Default'],
	    //也可以使用cachable声明是否缓存ajax响应，该参数默认为true，即缓存ajax响应
	    //cachable: false,
	    getTime: {
			url: '/getTime.php',
			'default': function(){
			      return Date.now()
			}
	    }
	});
	datasource.fetch('getTime', function(e, data){
	    console.log(data);
	});

	//默认order是["Remote", "Local", "Default"]
	//如果server和localstorage获取数据失败，可以使用`default`定义的数据替代
	var datasource = new $.DataSource({
	    name: 'datasource',
	    getUser: {
			url: 'getUser.php',
			method: 'POST',
			data: {sign: '************'},
			//可以是一个function
			//data: function(){ return {sign: "#########"}}

			'default': {
			    msg: 'Hello friend'
			},
			//可以是一个function
			//'default': function(){ return {msg: 'heelo friend'} }

			//用于检测网络是否可用，如果网络不可以，会忽略向server发请求。
			netFunction: function(){
			    return navigator.onLine;
			}
		}
	});
	datasource.fetch('getUser', function(e, data){
	});