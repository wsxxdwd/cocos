cc.Class({
    extends: cc.Component,

    properties: {
        usernameText: {
            default: null,
            type: cc.EditBox,
        },
        passwordText: {
            default: null,
            type: cc.EditBox,
        },
        repasswordText: {
            default: null,
            type: cc.EditBox
        },
        submitBtn: {
            default: null,
            type: cc.Button
        },
        loginLink: {
            default: null,
            type: cc.Label
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
        this.loginLink.node.on('click', function () {
            console.log(1)
            cc.director.loadScene('login');
        });
        this.submitBtn.node.on('click', function () {
            var username = that.usernameText.string;
            var password = that.passwordText.string;
            var repassword = that.repasswordText.string;
            if (!username.trim() || !password.trim() || !repassword.trim()) {
                that.errMsg.string = '请完整填写注册信息！';
                return;
            }
            if (password !== repassword) {
                that.errMsg.string = '两次密码不一样！';
                that.passwordText.string = '';
                that.repasswordText.string = '';
                return;
            }
            if (!/^\w+$/.test(username)) {
                that.errMsg.string = '账号格式不正确！';
                that.usernameText.string = '';
                return;
            }
            if (!/^[\w\@\!\#\$\%\^\&\*\.\~\-\+\=\{\}\[\]\:\;\"\'\\\\<\,\>\?\/]+$/.test(password)) {
                that.errMsg.string = '密码格式不正确！';
                that.passwordText.string = '';
                that.repasswordText.string = '';
                return;
            }
            Ajax('POST', 'http://114.215.125.102/api/user/signup',
                {
                    username: username,
                    password: password
                    
                }, function (res) {
                    try {
                        res = JSON.parse(res);
                        if (res.status == 1) {
                            that.errMsg.string = '注册成功！';
                            setTimeout(function() {
                                cc.director.loadScene('login');
                            }, 1000);
                        } else {
                            that.errMsg.string = '注册失败:' + res.msg;
                        }
                    } catch (e) {
                        that.errMsg.string = '注册失败!'
                    }
                }, function (err) {
                    that.errMsg.string = '网络错误！';
                });
        });
        function Ajax(type, url, data, success, failed){
            // 创建ajax对象
            var xhr = null;
            if(window.XMLHttpRequest){
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('Microsoft.XMLHTTP')
            }
         
            var type = type.toUpperCase();
            // 用于清除缓存
            var random = Math.random();
         
            if(typeof data == 'object'){
                var str = '';
                for(var key in data){
                    str += key+'='+data[key]+'&';
                }
                data = str.replace(/&$/, '');
            }
         
            if(type == 'GET'){
                if(data){
                    xhr.open('GET', url + '?' + data, true);
                } else {
                    xhr.open('GET', url + '?t=' + random, true);
                }
                xhr.send();
         
            } else if(type == 'POST'){
                xhr.open('POST', url, true);
                // 如果需要像 html 表单那样 POST 数据，请使用 setRequestHeader() 来添加 http 头。
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhr.send(data);
            }
         
            // 处理返回数据
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4){
                    if(xhr.status == 200){
                        success(xhr.responseText);
                    } else {
                        if(failed){
                            failed(xhr.status);
                        }
                    }
                }
            }
        }
 
    },
    
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
