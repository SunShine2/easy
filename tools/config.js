var cfg = {
    port:'8008',
    root:'D:\\attworkspace\\easy',

    //如果应用只存放在一个目录下面,可以使用下面的配置方法,默认访问地址为/apps
    //appRoot:'D:\\attworkspace\\easy\\tools\\examples'
    
    //应用存放在多个目录,可以使用以下配置方法,使用类似localhost/apps2的地址访问
    appRoot: {
        '/examples':'D:\\attworkspace\\easy\\tools\\examples',
        '/myapps':'D:\\myapps'
    },
    
    //build时的临时目录以及打包后zip文件存放的目录,如配置以后,不存在则会创建
    //zipDir:"zip文件存放目录",
    //创建新应用的模板
    //appTpl:"应用模板所在目录",
    //smushit服务地址
    smushitService:"http://wireless.aliyun-inc.com/smush.att/ws.php",
    //weinre服务地址
    weinreService:"http://wireless.aliyun-inc.com:8700/target/target-script-min.js"
};

module.exports = cfg;