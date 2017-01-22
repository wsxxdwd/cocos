cc.Class({
    extends: cc.Component,

    properties: {
        connectStatus: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        var ws = new WebSocket("ws://114.215.125.102:2346");
        window.ws = ws;
        ws.onopen = function (event) {
            console.log("Send Text WS was opened.");
            var data = {
                type: 'login',
                username: window.username,
                token: window.token
            }
            ws.send(JSON.stringify(data));
        };
        ws.onmessage = function (event) {
            console.log(event)
            that.connectStatus.string = '连接服务器成功';
            setTimeout(function () {
                cc.director.loadScene('newChar');
            }, 1000);
        };
        ws.onerror = function (event) {
            console.log("Send Text fired an error");
        };
        ws.onclose = function (event) {
            console.log("WebSocket instance closed.");
        };
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
