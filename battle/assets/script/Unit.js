var Astar = require("Astar");
cc.Class({
    extends: cc.Component,

    properties: {
        attackType: 1,
        movePoint: 4,
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        this.astar = new Astar(this.game.obstacle, this.game.mapWidth, this.game.mapHeight);
        this.acting = false;
        this.node.on('mousedown', function () {
            if (that.game.phase === 1 && that.side === 1) {
                that.showMoveArea();
            }
        });
        
        this.node.on('unitTurn', function () {
            that.showMoveArea();
        });
    },
    showMoveArea: function () {
        var that = this;
        if (this.side === 2) {
            return false;
        }
        var newTile;
        this.game.clearMoveTiles();
        this.acting = true;
        if (this.game.phase === 1) {
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 10; j++) {
                    if (this.checkTile(cc.p(i,j))) {
                        newTile = cc.instantiate(this.game.greenTile);
                        this.game.tiledMap.node.addChild(newTile);
                        newTile.setPosition(this.game.getPixelPos(cc.p(i, j)));
                        newTile.on('mousedown', moveAction);
                        this.game.tileList.push(newTile);
                    }
                }  
            }
        } else {
            var unitTilePos = this.game.getTilePos(cc.p(this.node.x, this.node.y));
            var pathList = [];
            var searchList = [unitTilePos];
            for (var step = 0; step <= this.movePoint; step++) {
                var tempList = [];
                for (var j = searchList.length - 1; j >= 0; j--) {
                    var top = cc.p(searchList[j].x ,searchList[j].y - 1);
                    var right = cc.p(searchList[j].x + 1 ,searchList[j].y);
                    var bottom = cc.p(searchList[j].x ,searchList[j].y + 1);
                    var left = cc.p(searchList[j].x - 1 ,searchList[j].y);
                    if (this.checkTile(top) && unique(top)) {
                        tempList.push(top);
                        pathList.push(top);
                    }
                    if (this.checkTile(right) && unique(right)) {
                        tempList.push(right);
                        pathList.push(right);
                    }
                    if (this.checkTile(bottom) && unique(bottom)) {
                        tempList.push(bottom);
                        pathList.push(bottom);
                    }
                    if (this.checkTile(left) && unique(left)) {
                        tempList.push(left);
                        pathList.push(left);
                    }
                    searchList.splice(j, 1);
                }
                searchList = searchList.concat(tempList);
            }
            function unique (pos) {
                for (var i in pathList) {
                    if (pathList[i].x === pos.x && pathList[i].y === pos.y) {
                        return false;
                    }
                }
                return true;
            }
            for (var k in pathList) {
                newTile = cc.instantiate(this.game.greenTile);
                this.game.tiledMap.node.addChild(newTile);
                newTile.setPosition(this.game.getPixelPos(pathList[k]));
                newTile.on('mousedown', moveAction);
                this.game.tileList.push(newTile);
            }
                        
        }
        function moveAction() {
            that.moveTo(that.game.getTilePos(cc.p(this.x, this.y)));
            that.game.clearMoveTiles();
            that.acting = false;
            if (that.game.phase === 2) {
                that.game.unitTurn.shift();
                that.game.actionBar.getComponent('actionBar').clearProgress(that.id);
                if (that.game.unitTurn.length === 0) {
                    that.game.actionBar.getComponent('actionBar').startAction();
                }
            }
        }
    },
    moveTo: function (tilePos) {
        var unitList;
        var pixelPos = this.game.getPixelPos(tilePos);
        if (this.side === 1) {
            unitList = this.game.playerUnits;
        } else if (this.side === 2) {
            unitList = this.game.enemyUnits;
        }
        for (var i in unitList) {
            if (unitList[i].id === this.id) {
                unitList[i].x = tilePos.x;
                unitList[i].y = tilePos.y;
                this.node.x = pixelPos.x;
                this.node.y = pixelPos.y;
                break;
            }
        }
    },
    checkTile: function (pos) {
        var i;
        if (pos.x < 0 || pos.y < 0 || pos.x >= this.game.mapWidth || pos.y >= this.game.mapHeight) {
            return false;
        }
        for (i in this.game.playerUnits) {
            if (this.game.playerUnits[i].x === pos.x && this.game.playerUnits[i].y === pos.y) {
                return false;
            }
        }
        for (i in this.game.enemyUnits) {
            if (this.game.enemyUnits[i].x === pos.x && this.game.enemyUnits[i].y === pos.y) {
                return false;
            }
        }
        if (this.game.obstacle.getTileGIDAt(pos)) {
            return false;
        }
        return true;
    },
    AIContoller: function (actionType) {
        var that = this;
        if (that.game.phase === 2) {
            if (that.side === 2) {
                switch (actionType) {
                    case 'move':
                        var start = that.game.getTilePos(cc.p(that.node.x, that.node.y));
                        var end = cc.p(0,0);
                        var path = this.astar.search(start, end);
                        if (path) {
                            if (path.length > that.movePoint) {
                                var nextStep = path[that.movePoint];
                            } else {
                                nextStep = path[path.length - 1];
                            }
                            that.moveTo(nextStep);
                        } else {
                            that.AIContoller('defence');
                            return;
                        }
                        break;
                    case 'attack':
                        break;
                    case 'escape':
                        break;
                    case 'defence':
                        break;
                }
                that.acting = false;
                that.game.unitTurn.shift();
                that.game.actionBar.getComponent('actionBar').clearProgress(that.id);
                if (that.game.unitTurn.length === 0) {
                    that.game.actionBar.getComponent('actionBar').startAction();
                }
            }
        }
    },
    
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.game.phase === 2 && this.game.unitTurn[0] === this.id && !this.acting) {
            if (this.side === 1) {
                this.showMoveArea();
            } else if (this.side === 2) {
                this.AIContoller('move');
            }
        }
    },
});
