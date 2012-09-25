/**
提供依赖查询,打包等功能
@module build
@main
**/
var serverConfig = require('../config'),
    path = require('path'),
    BuildHelper = require('./src/buildhelper.js');

var appName = process.argv[2];
BuildHelper.build(path.join(serverConfig.appRoot, appName));
