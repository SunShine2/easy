//从代码中获取依赖的信息
var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    smushit = require('node-smushit'),

    config = require('../../config');


/**
@module build
**/
/**
代码工具类集合
@class util
@static
**/

/*
var REQUIRE_RE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g;
function getDependenciesByCode(code){
    var ret = [], match;

    code = removeComments(code);
    REQUIRE_RE.lastIndex = 0;

    while ((match = REQUIRE_RE.exec(code))) {
      if (match[2]) {
        ret.push(match[2]);
      }
    }

    return unique(ret);
}
*/
/**
移除js注释代码
@method removeComments
@static
@param {String} code 需要移除注释的js代码
@return {String} code 移除注释以后的js代码
**/
function removeComments(code) {
    return code
        .replace(/^\s*\/\*[\s\S]*?\*\/\s*$/mg, '') // block comments
        .replace(/^\s*\/\/.*$/mg, ''); // line comments
}
 /*
//检查文件是否是模块文件, 通过define判断
var defineReg = /define\s*\(\s*function\s*\(\s*require/;
function isModuleFile(moduleCode) {
  return defineReg.test(moduleCode);
}
*/

/*base util*/
/**
判断url是否为http绝对地址
@method isHttp
@static
@param {String} url 需要判断的url
@return {Boolean} 是否为http绝对地址
**/
var httpReg = /^https?:.*/;
function isHttp(url){
  return httpReg.test(url);
}
/**
将值类型数组转化成hash表
@method unique
@static
@param {Array} arr 需要转化的数组
@return {Object} 数组对应的hash表
**/
function unique(arr) {
  var o = {};
  arr.forEach(function(item) {
    o[item] = 1;
  });
  return Object.keys(o);
}
/**
根据url判断是否为脚本文件
@method isJs
@static
@param {String} jsUri js文件的uri
@return {Boolean} 返回是否为js文件
**/
var regJs = /\.js(?:\?|$)/i;
function isJs(jsUri){
  return regJs.test(jsUri);
}

/**
根据url判断是否为样式文件
@method isCss
@static
@param {String} cssUri css(less)文件的uri
@return {Boolean} 返回是否为css(less)文件
**/
var regCss = /(\.css|\.less)(?:\?|$)/i;
function isCss(cssUri){
  return regCss.test(cssUri);
}
/*
//移除css引用的代码
var REQUIRE_CSS_RE = /[,;]?\s*((var)?\s*[A-Za-z0-9]\s*=\s*)?require\s*\(\s*["'][^"'\s]+(?:\.css|\.less)(\?[^'"]|\s*)*["']\)[^,;]*[,;]/g;
function removeCssRequire(code){
  //return code;
  return code.replace(REQUIRE_CSS_RE,'');
}

var REQUIRE_UNUSED_RE = /\s*((?:var)?\s*\w*\s*[=(\[\-\+\*\/]\s*)?require\s*\(\s*["'][^"'\s]+(\?[^'"]|\s*)*["']\)[^,;\n]*([,;\n]|$)/g;
function removeUnUsedRequire(code){
  return code.replace(REQUIRE_UNUSED_RE,function(a,b){
    return b?a:'';
  });
}
*/

/**
获取样式内容的依赖信息(@import的内容)
@method getCssDeps
@static
@param {String} strCss 需要查找依赖的css内容
@return {Array} 返回样式依赖的数组
**/
var CSS_IMPORT_RE = /@import\s*['"]\s*([^'"\s]+(\.less|\.css)?)\s*['"];/g;
function getCssDeps(strCss){
    var ret = [],match;
    while(match = CSS_IMPORT_RE.exec(strCss)){
        if(match[1]){
            ret.push(match[1]);
        }
    }
    return ret;
}

/**
将依赖信息从样式内容中删除掉(@import内容)
@method removeCssDeps
@static
@param {String} strCss 需要删除依赖信息的css内容
@return {String} 移除依赖信息以后的样式文件
**/
function removeCssDeps(strCss){
    var ret = strCss.replace(CSS_IMPORT_RE,'');
    return ret;
}

/**
修复样式文件合并以后图片地址不对应的问题
@method repaireCssImage
@static
@param {String} strCss 样式文件内容
@param {String} uri 样式文件uri
@param {String} appPath 应用的目录
@return {String} 修复图片地址以后的样式内容
**/
var CSS_IMAGE_RE = /url\s*\(\s*["']?(\S*)\.(png|jpg|jpeg|gif)(?:\??([^)]*))["']?\)/gi;
function repaireCssImage(strCss,uri,appPath){
    strCss = strCss.replace(CSS_IMAGE_RE,function(match,file,type,query){
        var fileName = file + '.' + type;
        if(!isHttp(fileName)){
            if(isHttp(uri)){
                fileName = path.dirname(uri) + '/' + fileName;
            } else {
                fileName = path.resolve(path.dirname(uri),fileName);
                fileName = path.relative(appPath,fileName);
                fileName = fileName.replace(/\\/g,'/');
            }
        }


        if(query !== ''){
            fileName += '?' + query;
        }

        return 'url(' + fileName + ')';
    });
    return strCss;
}

/**
获取样式文件中需要datauri的图片地址列表
@method getCssDatauriImgs
@static
@param {String} strCss 样式文件内容
@param {String} uri 样式文件uri
@param {String} appPath 应用的目录
@return {Array} 需要datauri的图片地址列表
**/
function getCssDatauriImgs(strCss,uri,appPath){
    var ret = [],match;
    while(match = CSS_IMAGE_RE.exec(strCss)){
        var file = match[1],
            type = match[2],
            datauri = match[3];
        if(/datauri/.test(datauri)){
            var fileName = file + '.' + type;
            if(uri){
                //fileName = path.dirname(uri) + '/' + fileName;
                ret.push(path.dirname(uri) + '/' + fileName);
            } else {
                if(isHttp(fileName)){
                    ret.push(fileName);
                } else {
                    ret.push(path.join(appPath,fileName));
                }
            }
        }
    }
    return ret;
}

/**
将需要datauri的图片替换成对应的base64内容
@method getCssDatauriReplace
@static
@param {String} strCss 样式文件内容
@param {Array} arrDataUri 样式文件uri
@return {Array} datauri转换以后的样式内容
**/
function getCssDatauriReplace(strCss,arrDataUri){
    var index = 0,val,strDataUri;
    strDataUri = strCss.replace(CSS_IMAGE_RE,function(match,file,type,datauri){
        if(/datauri/.test(datauri)){
            val = arrDataUri[index++];
            return 'url("data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + val + '")';
        }

        return 'url(' + file + '.' + type + ')';
    });

    return strDataUri;
}

/**
获取图片的base64内容
@method getImageBase64
@static
@async
@param {String} uri 图片路径
@param {Function} callback 获取成功以后的回调函数,参数:base64以后的图片内容
**/
function getImageBase64(uri,callback,isSmushit){
    if(isSmushit){
        if(!(isHttp(uri) || fs.existsSync(uri))){
            console.error('文件不存在:' + uri);
            callback('');
            return;
        }
        var smushitService = config.get('smushitService'),
            tmp = config.path('tmpPath'),
            extname = path.extname(uri),
            fileName = uri.replace(/[\/,\\,:.<>\|"'?*]/g,'_') + extname,
            //fileName = new Date().getTime() + extname,
            fullFileName = path.join(tmp,fileName);

        if(!fs.existsSync(tmp)){
            fs.mkdirSync(tmp);
        }
        smushit.smushit(uri,{
            output:fullFileName,
            onItemComplete:function(error,item,response){
                if(error || response.error){
                    //若smushit失败,则直接用未压缩的图片
                    getImageBase64(uri,callback);
                } else {
                    getImageBase64(fullFileName,function(val){
                        callback(val);
                        fs.unlinkSync(fullFileName);
                    });
                }
            },
            service:smushitService || undefined,
            verbose: false
        });
        return;
    }

    if(isHttp(uri)){
        http.get(uri,function(res){
            res.setEncoding('binary');
            if(res.statusCode !== 200){
                console.error('http请求失败:' + uri);
                callback('');
            } else {
                var str = '';
                res.on('data',function(data){
                    str += data;
                });

                res.on('end',function(){
                    var val = new Buffer(str,'binary').toString('base64');
                    callback(val);
                });
            }
        });
    } else {
        fs.exists(uri,function(exists){
            if(exists){
                fs.readFile(uri,function(err,data){
                    if(err){
                        console.error('文件读取失败:' + uri);
                        callback('');
                    } else {
                        callback(data.toString('base64'));
                    }
                });
            } else {
                console.error('文件不存在:' + uri);
                callback('');
            }
        });
    }
}

/**
获取文件内容
@method getFileContent
@static
@async
@param {String} uri 文件路径(本地或者远程)
@param {Function} callback 获取文件内容成功以后的回调函数,参数:文件内容
**/
function getFileContent(uri,callback){
    //console.log('加载文件:',uri);
    if(isHttp(uri)){
        http.get(uri,function(res){
            if(res.statusCode !== 200){
                console.error('http请求失败:' + uri);
                callback('');
            } else {
                var resStr = '';
                res.on('data',function(data){
                    resStr += data;
                });

                res.on('end',function(){
                    //console.log('获取文件完成:',uri);
                    //fs.writeFile();
                    callback(resStr.toString());
                });
            }
        });
    } else {
        fs.exists(uri,function(exists){
            if(exists){
                fs.readFile(uri,function(err,data){
                    if(err){
                        console.error('文件读取失败:' + uri);
                        callback('');
                    } else {
                        //console.log('获取文件完成:',uri);
                        callback(data.toString());
                    }
                });
            } else {
                console.error('文件不存在:' + uri);
                callback('');
            }
        });
    }
}

exports.getCssDeps = getCssDeps;
exports.removeCssDeps = removeCssDeps;
exports.repaireCssImage = repaireCssImage;
exports.getCssDatauriImgs = getCssDatauriImgs;
exports.getCssDatauriReplace = getCssDatauriReplace;
exports.removeComments = removeComments;
//exports.getDependenciesByCode = getDependenciesByCode;
//exports.removeCssRequire = removeCssRequire;
//exports.removeUnUsedRequire = removeUnUsedRequire;
//exports.isModuleFile = isModuleFile;
exports.isHttp = isHttp;
exports.isCss = isCss;
exports.isJs = isJs;
exports.unique = unique;
exports.getFileContent = getFileContent;
exports.getImageBase64 = getImageBase64;
//exports.commit = commit;
