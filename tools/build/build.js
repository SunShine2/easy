/**
提供依赖查询,打包等功能
@module build
@main
**/
var BuildHelper = require('./src/buildhelper'),
    commit = require('./src/util').commit;


exports.getBuildedContent = BuildHelper.getBuildedContent;
exports.build = BuildHelper.build;
exports.commit = commit;