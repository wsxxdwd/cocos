var Astar = require("Astar");
cc.Class({
    extends: cc.Component,

    properties: {
        player: {
            default: null,
            type: cc.Node
        },
        groundLayerName: {
            default: 'ground'
        },
        waterLayerName: {
            default: 'water'
        }
    },
    //将像素坐标转化为瓦片坐标
    getTilePos: function(posInPixel) {
        var mapSize = this.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var originPos = cc.p(mapSize.width / 2, 0);
        var x = Math.floor((posInPixel.x - originPos.x) / tileSize.width + (mapSize.height - posInPixel.y - originPos.y) / tileSize.height);
        var y = Math.floor((mapSize.height - posInPixel.y - originPos.y) / tileSize.height - (posInPixel.x - originPos.x) / tileSize.width);
        return cc.p(x, y);
    },
    updatePlayerPos: function() {
        var pos = this.ground.getPositionAt(this.playerTile);
        pos.x += 20;
        pos.y += 20;
        this.player.setPosition(pos);
    },
    tryMoveToNewTile: function(newTile) {
        var mapSize = this.tiledMap.getMapSize();
        if (newTile.x < 0 || newTile.x >= mapSize.width) return;
        if (newTile.y < 0 || newTile.y >= mapSize.height) return;
        var scrollX = 0;
        var scrollY = 0;
        if (this.player.x + this.node.x < 192) {
            scrollX = 96;
        } else if (this.player.x + this.node.x > cc.visibleRect.width - 192) {
            scrollX = -96;
        }
        if (this.player.y + this.node.y < 100) {
            scrollY = 96
        } else if (this.player.y + this.node.y >= cc.visibleRect.height - 192) {
            scrollY = -96
        }
        if (scrollX !== 0 || scrollY !== 0) {
            this.node.setPosition(cc.p(this.node.x + scrollX, this.node.y + scrollY));           
        }
        if (this.water.getTileGIDAt(newTile)) {//GID=0,则该Tile为空
            cc.log('This way is blocked!');
            return false;
        }

        this.playerTile = newTile;
        this.updatePlayerPos();
    },
    // use this for initialization
    initMapPos: function() {
        //this.node.setPosition(cc.visibleRect.bottomLeft);
    },
    onLoad: function () {
        var self = this;
        //地图
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        //水域图层
        this.water = this.tiledMap.getLayer(this.waterLayerName);
        this.ground = this.tiledMap.getLayer(this.groundLayerName);
        this.playerTile = this.getTilePos(cc.p(this.player.x, this.player.y));
        this.initMapPos();
        //更新player位置
        this.updatePlayerPos();
        this.astar = new Astar(this.water, this.tiledMap.getMapSize().width, this.tiledMap.getMapSize().height);
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function(keyCode, event) {
                var newTile = cc.p(self.playerTile.x, self.playerTile.y);
                switch(keyCode) {
                    case cc.KEY.up:
                        newTile.y -= 1;
                        break;
                    case cc.KEY.down:
                        newTile.y += 1;
                        break;
                    case cc.KEY.left:
                        newTile.x -= 1;
                        break;
                    case cc.KEY.right:
                        newTile.x += 1;
                        break;
                    default:
                        return;
                }
                self.tryMoveToNewTile(newTile);
            }
        }, self.node);
        this.bindEvent();
    },
    bindEvent: function () {
        var that = this;
        var node = this.node;
        this.node.on('mousedown', function (e) {
            var pos = that.getTilePos(cc.p(e._x - node.x, e._y - node.y));
            console.log(pos)
            that.playerMove(that.findPath(pos));
        });
    },
    findPath: function (target) {
        var start = cc.p(this.playerTile.x, this.playerTile.y);
        console.log(start, target)
        var path = this.astar.search(start, target, [], 20);
        console.log(path)
        if (path.length > 1) {
            path.shift();
            return path;
        }
        return [];
    },
    playerMove: function (path) {
        var that = this;
        clearTimeout(this.moveTimer);
        if (path.length) {
            this.tryMoveToNewTile(path[0]);
            path.shift();
            this.moveTimer = setTimeout(function() {
                that.playerMove(path);
            }, 100);
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
