cc.Class({
    extends: cc.Component,

    properties: {
        charNameText: {
            default: null,
            type: cc.EditBox,
        },
        createBtn: {
            default: null,
            type: cc.Button
        },
        errMsg: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        this.lock = false;
        this.createBtn.node.on('click', function () {
            var charName = that.charNameText.string;
            if (!charName.trim()) {
                that.errMsg.string = '请输入角色名！';
                return;
            }
            var data = {
                type: 'creatCharacter',
                charactername: charName.trim()
            }
            window.ws.send(JSON.stringify(data));
            window.ws.onmessage = function (event) {
                try {
                    var data = JSON.parse(event.data);
                    that.errMsg.string = data.msg;
                } catch (err) {
                    that.errMsg.string = '服务器错误！';
                }
                
            };
        });
    },
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
