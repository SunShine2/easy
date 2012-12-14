/*
 * author: youxiao@alibaba-inc.com
 * version: 2.1
 */

/*
 * config start ========================================
 */

//sdk的build所在目录
var SDKDIR = '../';

/*
 * config end   ========================================
 */

(function(){
    var fs = require('fs'),
        util = require('util'),
        child_process = require("child_process"),
        mustache = require("mustache"),
        less = require("less"),
        cleanCSS = require('clean-css'),
        smushit = require('node-smushit'),
        jsp = require("uglify-js").parser,
        pro = require("uglify-js").uglify,
        html_minifier = require('html-minifier').minify;

    var ENCODING = 'UTF-8',
        APPNAME = 'hongbao',
        IS_COMMIT = false,
        IS_DEBUG = false,
        APPID = '7184',
        APPDIR = SDKDIR + APPNAME,
        APPJSON = null,
        APPRESOURCES = {},
        TARGETS = {},
        IS_NEW_SDK = false,
        BUILDTARGETS = ['getAppJson', 'concatCss', 'concatScript', 'updateAppJson', 'renderIndex', 'smushit'];

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
                    //在js前增加';'，避免压缩时报错
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
            content = content.replace(/@charset\s+"utf-8";/gi, '');
        }
        if(params.destfile){
            fs.writeFileSync(dir+'/'+params.destfile, content, ENCODING);
        }
        return content;
    },
        moveFile = function(from, to, callback){
            console.log('[move] from: '+from+' to: '+to);

            var is = fs.createReadStream(from),
                os = fs.createWriteStream(to);

            util.pump(is, os, function() {
                fs.unlinkSync(from);
                callback && callback();
            });
        },
        sdk = function(callback){
            if(process.platform !== 'win32'){
                console.warn('[WARN] sdk only work on windows, run sdk build commond manually.');

                callback && callback();
                return;
            }

            console.log('[sdk] build');

            child_process.exec(fs.realpathSync(SDKDIR + 'python/win32/sdk.exe') + ' build '+APPNAME, function(e){
                if(!e){
                    callback && callback();
                }else{
                    console.log(e);
                }
            });
        },
        checkEvn = function(){
            if(!fs.existsSync){
                console.log('[ERROR] require Node.js v0.8.2+');
                return false;
            }
            return true;
        };

    var build = function(){
        if(!checkEvn()){
            return;
        }

        console.log('========BUILD START========');

        sdk(function(){
            moveFile(APPDIR+'.zip', APPNAME+'.zip', function(){
                TARGETS.unzip(function(){
                    BUILDTARGETS.forEach(function(item, index){
                        TARGETS[item]();
                    });
                });
            });
        });
    };

    TARGETS.unzip = function(callback){
        console.log('[unzip]');

        child_process.exec('unzip -o '+APPNAME+'.zip -d '+process.cwd(), function(e){
            if(!e){
                fs.unlinkSync(APPNAME+'.zip');
                if(fs.existsSync(APPNAME + '/framework')){
                    IS_NEW_SDK = true;
                }
                callback && callback();
            }else{
                console.log(e);
            }
        });
    };

    TARGETS.zip = function(){
        console.log('[zip]');

        child_process.exec('zip -r -m '+APPNAME+'.zip '+APPNAME, function(e){
            if(!e){
                if(IS_COMMIT){
                    if(!APPID){
                        console.log('[commit] failed, app id is require');
                    }else{
                        TARGETS.commit();
                    }
                }else{
                    moveFile(APPNAME+'.zip', APPDIR+'.zip', function(){
                        console.log('========BUILD FINISH========');
                    });
                }
            }else{
                console.log(e);
            }
        });
    };

    TARGETS.commit = function(){
        console.log('[commit]');

        child_process.exec('phantomjs commit.js '+APPNAME+'.zip '+APPID, function(e){
            if(!e){
                moveFile(APPNAME+'.zip', APPDIR+'.zip', function(){
                    console.log('========BUILD FINISH========');
                });
            }else{
                console.log(e);
            }
        });
    };

    TARGETS.getAppJson = function(){
        APPJSON = JSON.parse(fs.readFileSync(APPNAME + '/app.json', ENCODING));
    };

    TARGETS.concatCss = function(){
        console.log('[concat] css');

        var cssfiles = APPJSON.css.split(','),
            dir = APPNAME+'/res/css/';

        if(!IS_NEW_SDK && fs.existsSync(dir + 'aui.css')){
            cssfiles.unshift('aui.css');
        }

        APPRESOURCES.css = concat({
            dir: dir,
            includes: cssfiles,
            //destfile: 'combo.css',
            type: 'css'
        });

        APPRESOURCES.css = TARGETS.cleanCss(APPRESOURCES.css);

        if(IS_NEW_SDK){
            APPRESOURCES.css += TARGETS.cleanCss(concat({
                dir: APPNAME + '/framework/res/css/',
                includes: ['aui.css'],
                type: 'css'
            }));
        }

        APPJSON.css = APPNAME + '.css';

        fs.writeFileSync(dir + APPJSON.css, APPRESOURCES.css, ENCODING);
    };

    TARGETS.cleanCssFiles = function(){
        console.log('[clean-css] minify css');

        var dir = APPNAME+'/res/css/',
            files = fs.readdirSync(dir);

        files.forEach(function(item, index){
            var file = dir+'/'+item,
                final_code,
                orig_code;

            orig_code = fs.readFileSync(file, ENCODING);
            final_code = cleanCSS.process(orig_code);
            fs.writeFileSync(file, final_code, ENCODING);
        });
    };

    TARGETS.cleanCss = function(css){
        console.log('[clean-css] minify css');

        return cleanCSS.process(css);
    };

    TARGETS.concatCaf = function(){
        console.log('[concat] caf');

        var dir = APPNAME+'/lib/';
        if(IS_NEW_SDK){
            dir = APPNAME+'/framework/lib/';
            if(fs.existsSync(dir + 'aui_usedispose.lib.js')){
                console.log('[delete] aui_usedispose.lib.js');
                fs.unlinkSync(dir + 'aui_usedispose.lib.js');
            }
        }

        APPRESOURCES.script_caf = concat({
            dir: dir,
            includes: ['aui.tpl.js', 'caf.lib.js']
        });
    };

    TARGETS.concatHomeShell = function(){
        if(APPJSON.parent_app !== 'homeshell_uuid'){
            return;
        }

        console.log('[concat] homeshell');

        APPRESOURCES.script_homeshell = concat({
            dir: APPNAME+'/lib/',
            includes: ['homeshell.tpl.js', 'homeshell.lib.js']
        });
    };

    TARGETS.concatScript = function(){
        console.log('[concat] script');

        var files = APPJSON.lib.replace(APPNAME + '.lib', APPNAME + '.lib.js').replace(APPNAME + '.tpl', APPNAME + '.tpl.js').split(','),
            dir = APPNAME+'/lib/';

        APPRESOURCES.script = concat({
            dir: dir,
            includes: files
        });

        APPRESOURCES.script = TARGETS.uglifyJS(APPRESOURCES.script);

        APPJSON.lib = APPNAME + '.js';

        fs.writeFileSync(dir + APPJSON.lib, APPRESOURCES.script, ENCODING);
    };

    TARGETS.uglifyJS = function(code){
        console.log('[uglifyJS] compress js');

        var ast = jsp.parse(code);
        ast = pro.ast_mangle(ast);
        ast = pro.ast_squeeze(ast);

        return pro.gen_code(ast, {
            inline_script: true  //to escape occurrences of </script in strings
        });
    };

    TARGETS.uglifyJSFiles = function(){
        var dir = APPNAME+'/lib/',
            files = fs.readdirSync(dir);

        files.forEach(function(item, index){
            console.log('[uglifyJS] compress js - ' + item);
            var file = dir+'/'+item,
                final_code,
                ast,
                orig_code;

            orig_code = fs.readFileSync(file, ENCODING);
            ast = jsp.parse(orig_code); // parse code and get the initial AST
            ast = pro.ast_mangle(ast); // get a new AST with mangled names
            ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
            final_code = pro.gen_code(ast); // compressed code here
            fs.writeFileSync(file, final_code, ENCODING);
        });
    };

    TARGETS.updateAppJson = function(){
        console.log('[update] app.json');

        //sdk 环境下 读取app.json的时候仍然会加载某些资源
        fs.writeFileSync(APPNAME + '/app.json', JSON.stringify(APPJSON), ENCODING);
        //app manager依赖app.json
        //fs.unlinkSync(APPNAME + '/app.json');
    };

    TARGETS.minifyHTML = function(html){
        console.log('[html minifier] minify index.html');

        return html_minifier(html, {
            removeComments: true
        });
    };

    TARGETS.renderIndex = function(){
        console.log('[mustache] render index.html');

        APPRESOURCES.app_title = APPJSON.title;
        APPRESOURCES.app_name = APPJSON.name;
        APPRESOURCES.app_json = JSON.stringify(APPJSON);
        APPRESOURCES.app_name_widthout_extension = APPNAME;
        APPRESOURCES.debug = IS_DEBUG;
        APPRESOURCES.is_new_sdk = IS_NEW_SDK;

        var template = fs.existsSync('template/'+APPNAME+'.html')?APPNAME:'index',
            html = fs.readFileSync('template/'+template+'.html', ENCODING);
        html = TARGETS.minifyHTML(mustache.to_html(html, APPRESOURCES));
        fs.writeFileSync(APPNAME+"/index.html", html, ENCODING);
    };

    TARGETS.less = function(){
        var dir = APPNAME+'/res/css/',
            files = fs.readdirSync(dir);

        files = files.filter(function(item){
            return /.+\.less/.test(item)
        });

        if(!files.length){
            return;
        }

        console.log('[less] translate .less files');

        files.forEach(function(item, index){
            var file = dir+'/'+item,
                orig_code = fs.readFileSync(file, ENCODING).toString();
            less.render(orig_code, function (e, css) {
                fs.unlinkSync(file);
                fs.writeFileSync(file.replace('.less', '.css'), css, ENCODING);
            });
        });
    };

    TARGETS.smushit = function(){
        smushit.smushit(APPNAME, {
            onComplete: TARGETS.zip,
            service: 'http://wireless.aliyun-inc.com/smush.att/ws.php'
        });
    };

//run build
    build();
})();