var cfg = {
    port:'8008',  //服务器端口
    root:'',  //默认根目录
    wsservices_port:8188,   //webSocket端口,为0则不启用

    //如果应用只存放在一个目录下面,可以使用下面的配置方法,默认访问地址为/apps
    appRoot:'examples',
    
    //应用存放在多个目录,可以使用以下配置方法,使用类似localhost/apps2的地址访问,支持以root为基准的相对目录配置
    /*
    appRoot: {
        '/examples':'examples',
        '/myapps':'D:\\myapps',
        '/zhengxie':'D:\\attworkspace\\labs\\zhengxie'
    },
    */
    caf:null,   //caf框架所在目录
    zipDir:"target",//build时的临时目录以及打包后zip文件存放的目录,如配置以后,不存在则会创建
    appTpl:"examples/demo",//创建新应用的模板
    tmpPath:'tmp',  //datauri时smushit图片临时存放目录
    smushitService:"http://wireless.aliyun-inc.com/smush.att/ws.php",//smushit服务地址
    weinreService:"http://wireless.aliyun-inc.com:8700/target/target-script-min.js"//weinre服务地址
};

module.exports = cfg;