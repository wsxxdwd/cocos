cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        this.label.string = this.text;
        var ws = new WebSocket("ws://114.215.125.102:2346");
        ws.onopen = function (event) {
            console.log("Send Text WS was opened.");
            ws.send("Adivon");
        };
        ws.onmessage = function (event) {
            that.label.string = event.data;
        };
        ws.onerror = function (event) {
            console.log("Send Text fired an error");
        };
        ws.onclose = function (event) {
            console.log("WebSocket instance closed.");
        };
    },

    // called every frame
    update: function (dt) {

    },
});
