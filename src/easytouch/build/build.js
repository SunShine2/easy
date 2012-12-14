/*
 * author: youxiao@alibaba-inc.com
 * version: 2.3.0
 */

/*
 * config start ========================================
 */

var RESOURCE_ROOT = '../';
var APPNAME = 'hongbao';

/*
 * config end   ========================================
 */

(function(){
    var fs = require('fs'),
        path = require('path'),
        util = require('util'),
        child_process = require("child_process"),
        mustache = require("mustache"),
        less = require("less"),
        cleanCSS = require('clean-css'),
        wrench = require("wrench"),
        smushit = require('node-smushit'),
        jsp = require("uglify-js").parser,
        pro = require("uglify-js").uglify,
        html_minifier = require('html-minifier').minify;

    var ENCODING = 'UTF-8',
        IS_COMMIT = false,
        IS_DEBUG = false,
        RESOURCE_DIR = RESOURCE_ROOT + APPNAME + '/',
        APPDIR = APPNAME + '/',
        APPJSON = {},
        TARGETS = {},
        BUILDTARGETS = ['copy', 'getAppJson', 'less', 'dataURI', 'index', 'zip'];

    process.argv.forEach(function(item, index){
        if(item === '-c'){
            IS_COMMIT = true;
        }
        if(item === '-d'){
            IS_DEBUG = true;
        }
    });

    var concat = function(params){
        var content = '',
            dir = params.dir,
            _concat = function (file){
                var file = dir+'/'+file,
                    _content = fs.readFileSync(file, ENCODING),
                    prefix = (!params.type || params.type === 'js') && _content.charAt(0) !== ';'?';':'';

                content += prefix + _content;
                fs.unlinkSync(file);
            };

        if(Array.isArray(params.includes)){
            params.includes.forEach(function(item, index){
                _concat(item);
            });
        }else{
            var files = fs.readdirSync(dir);

            files.forEach(function(item, index){
                if(params.includes.test(item) && (params.excludes ? !params.excludes.test(item) : true)){
                    _concat(item);
                }
            });
        }
        if(params.type === 'css'){
            content = content.replace(/@charset\s+"utf-8";/gi, '').replace(/\.\.\/images\//gi, 'res/images/');
        }
        if(params.destfile){
            fs.writeFileSync(dir+'/'+params.destfile, content, ENCODING);
        }
        return content;
    };

    TARGETS.copy = function(){
        console.log('copy files');
        if(fs.existsSync(APPNAME)){
            wrench.rmdirSyncRecursive(APPNAME);
        }
        wrench.mkdirSyncRecursive(APPNAME, 0777);
        wrench.copyDirSyncRecursive(RESOURCE_DIR, APPNAME);
    };

    TARGETS.getAppJson = function(){
        APPJSON = JSON.parse(fs.readFileSync(APPDIR + '/app.json', ENCODING));
    };

    TARGETS.index = function(){
        console.log('parse index.html');
        var content = fs.readFileSync(APPDIR + 'index.html', ENCODING).toString();
        content = TARGETS.replaceLess(content);
        content = TARGETS.delResources(content);
        content = TARGETS.replaceComboCSS(content);
        content = TARGETS.replaceComboJS(content);
        fs.writeFileSync(APPDIR + 'index.html', content, ENCODING);
    };

    TARGETS.replaceLess = function(content){
        return content.replace(/\s<.+stylesheet\/less.+href=".*\/(.+\.less)">\s/g, function(txt, href){
            var target = href.replace('.less', '.css');
            console.log('replaceLess: %s to %s', href, target);
            return '<link rel="stylesheet" href="css/'+target+'">';
        });
    };

    TARGETS.delResources = function(content){
        return content.replace(/<!--#build:del-->[\s\S]+<!--\/build:del-->/g, function(resources){
            resources.replace(/src=".*\/(.+)"/g, function(txt, resource){
                console.log('delResources: %s', resource);
            });
            return '';
        });
    };

    TARGETS.replaceComboJS = function(content){
        console.log('replaceComboJS');
        return content.replace(/<!--#build:comboJS-->[\s\S]+<!--\/build:comboJS-->/, function(resources){
            var includes = [];
            resources.replace(/src\s*=\s*['"].+\/([^\/]+\.js)['"]/g, function(txt, src){
                includes.push(src);
            });
            TARGETS.comboJS(includes);
            return '<script src="js/combo.js"></script>';
        });
    };

    TARGETS.replaceComboCSS = function(content){
        console.log('replaceComboCSS');
        return content.replace(/<!--#build:comboCSS-->[\s\S]+<!--\/build:comboCSS-->/, function(resources){
            var includes = [];
            resources.replace(/href\s*=\s*['"].+\/([^\/]+\.css)['"]/g, function(txt, src){
                includes.push(src);
            });
            TARGETS.comboCSS(includes);
            return '<link rel="stylesheet" href="css/combo.css">';
        });
    };

    TARGETS.comboJS = function(files){
        var dir = APPDIR + '/js/';

        var script = TARGETS.uglifyJS(concat({
            dir: dir,
            includes: files
        }));

        fs.writeFileSync(dir + 'combo.js', script, ENCODING);
    };

    TARGETS.uglifyJS = function(code){
        console.log('uglifyJS');

        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);

        return pro.gen_code(ast, {
            inline_script: true  //to escape occurrences of </script in strings
        });
    };

    TARGETS.comboCSS = function(files){
        var dir = APPDIR + 'css';

        var css = TARGETS.cleanCss(concat({
            dir: dir,
            includes: files,
            type: 'css'
        }));

        fs.writeFileSync(dir + 'combo.css', css, ENCODING);
    };

    TARGETS.cleanCss = function(css){
        console.log('clean-css');
        return cleanCSS.process(css);
    };

    TARGETS.less = function(){
        var dir = APPDIR + 'less/',
            cssDir = APPDIR + 'css/',
            files = fs.readdirSync(dir);

        if(!files.length){
            return;
        }

        files.forEach(function(item, index){
            console.log('render less: %s', item);
            var file = dir+'/'+item,
                target = cssDir+'/'+item,
                orig_code = fs.readFileSync(file, ENCODING).toString();
            orig_code = orig_code.replace(/@import "(.+\.less)";/g, function(txt, href){
                href = path.resolve(RESOURCE_DIR + 'less', href);
                return '@import "'+href+'";';
            });
            less.render(orig_code, function (e, css) {
                fs.unlinkSync(file);
                fs.writeFileSync(target.replace('.less', '.css'), css, ENCODING);
            });
        });
    };

    //启动dataURI，在url参数后增加注释， 如： background: #fff url(xxx)/*datauri*/ no-repeat 0 0;
    TARGETS.dataURI = function(){
        setTimeout(function(){
        var dir = APPDIR+'css/',
            files = fs.readdirSync(dir),
            tempfiles = [];
        files.forEach(function(item, index){
            var css = fs.readFileSync(dir + item, ENCODING).toString(),
            css = css.replace(/url\s*\(\s*["']?(\S*)\.(png|jpg|jpeg|gif)\?datauri["']?\s*\)/gi, function (match, file, type) {
                var file = path.resolve(dir, file + '.' + type);
                if(!fs.existsSync(file)){
                    console.log("dataURI: %s is not exist.", file);
                    return match;
                }
                console.log('dataURI: ' + file);
                tempfiles.push(file);
                var base64 = fs.readFileSync(file).toString('base64');
                base64 = 'url("data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + '")';
                return base64;
            });
            fs.writeFileSync(dir + item, css, ENCODING);
        });
        tempfiles.forEach(function(item){
            if(fs.existsSync(item)){
                console.log('dataURI: delete ' + item);
                fs.unlinkSync(item);
            }
        });
        }, 200);
    };

    TARGETS.zip = function(){
        console.log('zip');
        setTimeout(function(){
            child_process.exec('zip -r -m '+APPNAME+'.zip '+APPNAME, function(e){
                if(!e){
                    if(IS_COMMIT){
                        if(!APPJSON.id){
                            console.log('commit failed, app id is require in app.json');
                        }else{
                            TARGETS.commit();
                        }
                    }else{
                        console.log('build success');
                    }
                }else{
                    console.log(e);
                }
            });
        }, 200);
    };

    TARGETS.commit = function(){
        console.log('commit');
        var version = APPJSON.version?' '+APPJSON.version:'';
        var phantom = child_process.exec('phantomjs commit.js '+APPNAME+'.zip '+APPJSON.id+version, function(e){
            if(!e){
                console.log('build success');
            }else{
                console.log(e);
            }
        });
        phantom.stdout.on('data', function (data) {
            console.log('commit: ' + data);
        });
        phantom.stderr.on('data', function (data) {
            console.log('commit: ' + data);
        });
    };

    BUILDTARGETS.forEach(function(item, index){
        TARGETS[item]();
    });
})();