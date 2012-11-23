var path = require('path'),

    cfg_default = require('./config_default'),
    cfg_user = require('../../config');

var cfg = cfg_default,
    path_base = path.join(__dirname,'../../');

if(cfg_user && typeof cfg_user === 'object'){
    for(var p in cfg){
        if(cfg_user[p] !== undefined){
            cfg[p] = cfg_user[p];
        }
    }
}

function isAbsolutePath(v){
    return ~v.indexOf(':') || v[0] === '/';
}

//appRoot特殊处理
function appRoot(){
    var root = _path('root'),
        v = cfg['appRoot'];
    if(v){
        if(typeof v === 'string'){
            v = {'/apps':v};
        }
        for(var p in v){
            v[p] = isAbsolutePath(v[p])?v[p]:path.join(root,v[p]);
        }
        return v;
    }
}

function _get(k){
    return cfg[k];
}

function _path(k){
    if(k === 'appRoot'){
        return appRoot();
    } else {
        var v = cfg[k];
        return isAbsolutePath(v)?v:path.join(path_base,v);
    }
}

module.exports = {
    get: _get,
    path: _path
};