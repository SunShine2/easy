/**
提供server服务,目录浏览等功能
@module server
@main
**/

/**
虚拟的全局对象,server中所有module.exports = function(){}的方法均放在该对象下面
@class server_global
@main
**/

var http = require('http'),

    express = require('express'),
    
    config = require('./config'),
    index = require('./server/index_web'),
    resource = require('./server/resource'),
    proxy = require('./server/proxy'),
    directory = require('./server/directory'),
    create = require('./server/create'),
    build = require('./server/build'),
    virtual = require('./server/virtual'),
    empty = require('./server/empty'),
    cfgManager = require('./server/config'),
    commit = require('./server/commit'),
    wsserver = require('./server/wsservices');

    caf = require('./modules/caf'),
    build_caf = require('./modules/caf/build'),
    commit_caf = require('./modules/caf/commit'),
    cafCfgMgr = require('./modules/caf/config');

var app = express();
var ws = wsserver(config.get('wsservices_port'));

var static_dir = config.path('root'),
    virtualRouter = {'/__public':__dirname + '\\public'},
    appRoot = config.path('appRoot') || {},
    port = config.get('port');

virtual.setVirtuals(virtualRouter);
virtual.setVirtuals(appRoot);
directory.setAppPath(appRoot);

app.use(express.bodyParser());
/*route*/
//caf

if(caf){
    var routeCaf = caf(virtual,directory);
    app.get(/^\/build\/php\/proxy.php/,proxy);
    app.post(/^\/build\/php\/proxy.php/,proxy);
    app.get(/^\/__buildApp_caf(.*)/,build_caf);
    app.get(/^\/__commitApp_caf(.*)/,commit_caf);
    app.get(/^\/caf\/?(.*)/,routeCaf);
    app.get(/^\/__config_caf\/([^\/]*)\/(.*)/,cafCfgMgr);
    app.post(/^\/__config_caf\/([^\/]*)\/(.*)/,cafCfgMgr);
    app.get(/^\/__cache(.*)/,proxy);
}

//empty
app.get('/favicon.ico',empty);
//__resource
app.get(/^\/__resource(.*)$/,resource);

//proxy
app.get(/^\/proxy\/(.*)/,proxy);
app.post(/^\/proxy\/(.*)/,proxy);

//index
app.get(/^(.*)\/index.html$/,index);
//app.get('/:appName/index.html',index);

//config
app.get(/^\/__config\/([^\/]*)\/(.*)/,cfgManager);
app.post(/^\/__config\/([^\/]*)\/(.*)/,cfgManager);

app.get(/^\/__buildApp(.*)/,build);
app.get(/^\/__commitApp(.*)/,commit);
app.post(/^\/__createNewApp(.*)/,create);

app.use(virtual);
app.use(directory(static_dir));

app.use(express.static(static_dir));
app.use(express.directory(static_dir));

http.createServer(app).listen(port,function(){
    console.log('web服务已启动,端口:',port);
}).on('error',function(e){
    console.log('web服务启动失败!端口:' + port + ".请检查端口是否已被占用");
});
