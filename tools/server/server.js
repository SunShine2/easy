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
    path = require('path'),

    express = require('express'),
    
    config = require('../config'),
    index = require('./src/index'),
    resource = require('./src/resource'),
    proxy = require('./src/proxy'),
    directory = require('./src/directory'),
    create = require('./src/create'),
    build = require('./src/build'),
    virtual = require('./src/virtual'),
    empty = require('./src/empty');

var app = express();
var static_dir = config.root;


var virtualRouter = {
    '/__public':__dirname + '\\public'
};

var appRoot = typeof config.appRoot === 'string' ? {'/apps':config.appRoot}:config.appRoot;

for(var appDir in appRoot){
    virtualRouter[appDir] = appRoot[appDir];
}

directory.setAppPath(appRoot);

/*route*/
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

app.get(/^\/__buildApp(.*)/,build);
app.get(/^\/__createNewApp\/([^\/]*)\/(.*)/,create);

app.use(virtual(virtualRouter));
app.use(directory(static_dir));

app.use(express.static(static_dir));
//app.use(express.directory(static_dir));

console.log()

http.createServer(app).listen(config.port);


