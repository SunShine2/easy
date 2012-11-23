
var util = require('./util');

exports = module.exports = DepInfo;

/**
@module build
**/
/**
依赖信息类
@class DepInfo
@constructor
@param {String} appPath 应用所在目录
@param {Array} rModules Deps中获得的模块依赖信息
**/
function DepInfo(appPath,rModules){
    this._appPath = appPath;
    this._rModules = rModules;
    this._excludeFiles = [];

    this._orderedModulesGroup = null;

    this._init();
}

/**
初始化
@method _init
@private
**/
DepInfo.prototype._init = function(){
    this._orderedModulesGroup = this._getOrderedModuleGroup(this._rModules);
};

/**
往Info中添加已处理(不需要打包)的文件信息
@method appendExclude
@param {String} file 文件路径
**/
DepInfo.prototype.appendExclude = function(file){
    if(file && !this._excludeFiles[file]){
        this._excludeFiles[file] = 1;
    }
};

/**
获取已处理(不需要打包)的文件信息
@method getExclude
@return {Object} 不需要包含的文件hash表
**/
DepInfo.prototype.getExclude = function(){
    return this._excludeFiles;
};

/**
获取原生的依赖关系
@method getDependencies
@return {Object} 未处理的依赖关系
**/
DepInfo.prototype.getDependencies = function(){
    return this._rModules;
};

/**
获取已排序的根模块信息
@method getOrderedJsModuleGroup
@return {Array} 已排序的根模块信息
**/
DepInfo.prototype.getOrderedJsModuleGroup = function(){
    return this._orderedModulesGroup.js;
};


/**
获取根模块依赖的样式文件
@method getCssModules
@return {Object} 根模块依赖的样式文件
**/
DepInfo.prototype.getCssModules = function(){
    return this._orderedModulesGroup.css;
};


/*
//获取已排序的跟模块文件路径
DepInfo.prototype.getOrderedJsGroup = function(){
    return this._getOrderedJsGroup(this._orderedModulesGroup.js);
};
DepInfo.prototype._getOrderedJsGroup = function(orderedModules){
    var jsList = [];
    for(var i = 0; i<orderedModules.length; i++){
        for(var j = 0; j<orderedModules[i].length; j++){
            var m = orderedModules[i][j];
            if(m.path){
                jsList.push(m.path);
            }
        }
    }
    return jsList;
};
*/



/**
按根模块分组分别获取各自的依赖,后面模块中的依赖如果在前一个根模块中已经获取,则不再加载
@method _getOrderedModuleGroup
@private
@param {Array} rModules 需要进行排序的根模块数组
@return {Object} 已排序的模块信息,包含样式模块和脚本模块的依赖信息
**/
DepInfo.prototype._getOrderedModuleGroup = function(rModules){
    var orderedJsModulesGroup = [],
        orderedCssModulesGroup = [],
        i,j,k;

    for(i = 0; i < rModules.length; i++){
        var depModules = [],
            stack = [];
        stack.push(rModules[i]);
        while(stack.length !== 0){
            var node = stack[stack.length - 1],
                isAllVisited = true;
            //console.log('分析节点:',node);
            if(this._excludeFiles[node.uri]){
                //节点已经缓存,则放弃该节点的依赖查找
                //console.log('节点已包含',node.uri);
                stack.pop();
                continue;
            }

            //将依赖模块中未访问的第一个模块入栈
            for(j = 0; j < node.deps.length; j++){
                if(!node.deps[j].visited){
                    stack.push(node.deps[j]);
                    isAllVisited = false;
                    break;
                }
            }

            if(isAllVisited){
                node = stack.pop();
                if(node.type === 'css'){
                    //css模块不需要分组
                    node = this._removeImports(node);
                    node = this._repaireCssImage(node);
                    orderedCssModulesGroup.push(node);
                } else {
                    //node = this._reDefine(node);
                    depModules.push(node);
                }
                this._excludeFiles[node.uri] = 1;
                node.visited = true;
            }
        }
        orderedJsModulesGroup.push({uuid:rModules[i].uuid,modules:depModules});
    }
    return {
        js:orderedJsModulesGroup,
        css:orderedCssModulesGroup
    };

};

//如果模块是define方式定义的,则在define时将依赖信息写入
/*
DepInfo.prototype._reDefine = function(module){
    if(module.isModuleDefine){
        var strDeps = '[';
        for(var i=0; i<module.deps.length; i++){
            if(module.deps[i].isSeajsModule){
                if(strDeps !== '['){
                    strDeps += ',';
                }
                strDeps += "'" + module.deps[i].alias + "'";
            }
        }
        strDeps += ']';
        strDeps = module.deps.length === 0 ? '' : strDeps + ',';

        var strFactory = module.factory.toString();
        strFactory = util.removeUnUsedRequire(strFactory);
        module.content =  '\ndefine("' + module.alias +'",' + strDeps + strFactory + ');';
    }
    return module;
};
*/
/**
移除样式模块中import内容
@method _removeImports
@private
@param {Object} 需要移除import信息的样式模块
@return {Object} 移除import信息以后的样式模块信息
**/
DepInfo.prototype._removeImports = function(m){
    m.content = util.removeCssDeps(m.content);
    return m;
};

/**
修复样式合并后图片路径不对应的问题
@method _repaireCssImage
@private
@param {Object} 需要修复图片路径的样式模块
@return {Object} 修复图片路径后的样式模块
**/
DepInfo.prototype._repaireCssImage = function(m){
    m.content = util.repaireCssImage(m.content,m.uri,this._appPath);
    return m;
};

