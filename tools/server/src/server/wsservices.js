/*websocket server*/
var wss = require('ws');

var READYSTATE = {CONNECTING:0,OPEN:1,CLOSING:2,CLOSED:3};
var console2 = {};
console2.log = console.log;
console2.warn = console.warn;

console2.info = console2.log;
console2.error = console2.warn;

var clients = {
    _clients: [],
    add: function(ws){
        this._clients.push(ws);
    },
    remove: function(ws){
        var index = 0;
        if(typeof ws === 'number'){
            index = ws;
        } else {
            for(var i = 0; i < this._clients.length; i++){
                if( (typeof ws === 'string' && this._clients[i].upgradeReq.headers['sec-websocket-key'] === ws)
                    || ws === this._clients[i] ){
                    index = i;
                    break;
                }
            }
        }
        this._clients.splice(index,1);
    },
    count: function(){
        return this._clients.length;
    },
    each: function(fn){
        for(var i = 0; i < this._clients.length; i++){
            fn(this._clients[i]);
        }
    },
    get: function(index){
        if(typeof index === 'string'){
            for(var i = 0; i < this._clients.length; i++){
                if(this._clients.upgradeReq.headers['sec-websocket-key'] === index){
                    index = i;
                    break;
                }
            }
        }

        if(typeof index !== 'number' || index < 0){
            return null;
        }
        
        return this._clients[index];
    }
};

module.exports = function(port){
    if(port > 0){
        console2.log('websocket监听已启动,端口:',port);
        server = new wss.Server({port:port});
        server.on('connection', function (ws) {
            clients.add(ws);
            console2.log("新连接,连接数:",clients.count());

            if(console.log === console2.log){
                console.log = send('log');
                console.warn = send('warn');
                console.info = send('info');
                console.error = send('error');
            }

            ws.on('message', function (msg) {
                //cons.log('收到数据:',msg);
            });
            ws.on('close', function () {
                clients.remove(ws);
                console2.log('断开连接,连接数:',clients.count());
                ws = null;
            });
            ws.on('error',function(){
                console2.log('websocket连接失败!');
            });
        }).on('error',function(){
            console2.log('websocket启动失败,端口:',port);
        });
    }
};

function send(type){
    return function(){
        var i;
        console2[type].apply(console2,arguments);

        var args = arguments,
            msg = '',
            retObj = {};
            
        for(i = 0; i < args.length; i++){
            var arg = args[i];
            if(typeof arg === 'object'){
                try{
                    msg = JSON.stringify(arg);
                } catch(e){
                    msg = 'Circle:' + arg.toString();
                }
            } else {
                msg += ((arg && arg.toString)?arg.toString():arg) + '';
            }
            msg += ' ';
        }

        retObj = {
            msg:msg,
            type:type
        };


        //给所有客户端发消息
        clients.each(function(ws){
            if(ws.readyState === READYSTATE.OPEN){
                ws.send(JSON.stringify(retObj));
            }
        });
    };
}

