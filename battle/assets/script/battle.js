cc.Class({
    extends: cc.Component,

    properties: {
        footmanPrefab: {
            default: null,
            type: cc.Prefab
        },
        archerPrefab: {
            default: null,
            type: cc.Prefab
        },
        greenTile: {
            default: null,
            type: cc.Prefab
        },
        redTile: {
            default: null,
            type: cc.Prefab
        },
        redPrepareLine: {
            default: null,
            type: cc.Layout
        },
        greenPrepareLine: {
            default: null,
            type: cc.Layout
        },
        startBtn: {
            default: null,
            type: cc.Button
        },
        actionBar: {
            default: null,
            type: cc.Layout
        }
    },

    // use this for initialization
    onLoad: function () {
        this.actionBar.getComponent('actionBar').game = this;
        this.initInfo();
        this.battleStage(this.phase);
        this.addEvent();
    },
    addEvent: function () {
        var that = this;
        var scrollX = 0;
        var speed = 5;
        this.node.on('mousemove', function (event) {
            if (event._x < 128) {
                scrollX = speed;
            } else if (event._x > 832){
                scrollX = -speed;
            } else {
                scrollX = 0;
            }
        });
        this.schedule(function() {
            if ((scrollX > 0 && this.node.x < 0) || (scrollX < 0 && this.node.x > (cc.visibleRect.width - that.node.width))) {
                this.node.x += scrollX;
            }
        }, 0.01);  
        this.startBtn.node.on('mousedown', function () {
            that.phase = 2;
            that.battleStage(2);
        });
    },
    battleStage: function (phase) {
        switch(phase) {
            case 1:
                this.prepare();
                break;
            case 2:
                this.battleStart();
                break;
            case 3:
                this.summary();
                break;
        }
    },
    prepare: function () {
        var that = this;
        var id = 0;
        // 初始玩家军队布局
        for (var i in this.playerTroop) {
            var randomTile = this.getPreparePos(1);
            that.playerTroop[i].side = 1;
            this.playerUnits.push({
                id: id,
                x: randomTile.x,
                y: randomTile.y,
                unit: that.playerTroop[i]
            });
            this.renderUnit(id, this.playerTroop[i], randomTile);
            id += 1;
        }
        for (var j in this.enemyTroop) {
            var randomTile = this.getPreparePos(2);
            that.enemyTroop[j].side = 2;
            this.enemyUnits.push({
                id: id,
                x: randomTile.x,
                y: randomTile.y,
                unit: that.enemyTroop[j]
            });
            this.renderUnit(id, this.enemyTroop[j], randomTile);
            id += 1;
        }
    },
    getPreparePos: function (type) {
        var pos;
        var i;
        if (type === 1) {
            var availableTiles1 = this.prepareWidth1 * this.prepareHeight1;
            if (this.playerUnits.length > availableTiles1) {
                return false;
            }
            pos = cc.p(Math.floor(cc.random0To1() * this.prepareWidth1), Math.floor(cc.random0To1() * this.prepareHeight1));
            for (i in this.playerUnits) {
                if (this.playerUnits[i].x === pos.x && this.playerUnits[i].y === pos.y) {
                    return this.getPreparePos(1);
                }
            }
            return pos;
        } else if (type === 2) {
            var mapSize = this.tiledMap.getMapSize();
            var availableTiles2 = this.prepareWidth2 * this.prepareHeight2;
            if (this.enemyUnits.length > availableTiles2) {
                return false;
            }
            pos = cc.p(mapSize.width - 1 - Math.floor(cc.random0To1() * this.prepareWidth2), Math.floor(cc.random0To1() * this.prepareHeight2));
            for (i in this.enemyUnits) {
                if (this.enemyUnits[i].x === pos.x && this.enemyUnits[i].y === pos.y) {
                    return this.getPreparePos(2);
                }
            }
            return pos;
        }
    },
    renderUnit: function (id, unit, position) {
        var tileSize = this.tiledMap.getTileSize();
        var mapSize = this.tiledMap.getMapSize();
        var newUnit;
        var unitCom;
        if (unit.type === 'footman') {
            newUnit = cc.instantiate(this.footmanPrefab);
            unitCom = newUnit.getComponent('footman');
        } else if (unit.type === 'archer') {
            newUnit = cc.instantiate(this.archerPrefab);
            unitCom = newUnit.getComponent('archer');
        } else {
            return false;
        }
        unitCom.game = this;
        unitCom.id = id;
        unitCom.side = unit.side;
        unitCom.charname = unit.name;
        unitCom.att = unit.att;
        unitCom.hp = unit.hp;
        unitCom.def = unit.def;
        unitCom.speed = unit.speed;
        unitCom.skill = unit.skill;
        this.node.addChild(newUnit);
        newUnit.setPosition(this.getPixelPos(position));
    },
    battleStart: function () {
        var that = this;
        this.clearMoveTiles();
        this.greenPrepareLine.node.destroy();
        this.redPrepareLine.node.destroy();
        this.startBtn.node.destroy();
        this.actionBar.node.y = 600;
        this.actionBar.node.emit('actionBarStart', {
            playerUnits: that.playerUnits, 
            enemyUnits: that.enemyUnits
        });
    },
    summary: function () {
        
    },
    initInfo: function () {
        this.tiledMap = this.node.getComponent('cc.TiledMap');
        this.obstacle = this.tiledMap.getLayer('water');
        this.mapWidth = 20;
        this.mapHeight = 10;
        this.prepareWidth1 = 3;
        this.prepareHeight1 = 10;
        this.prepareWidth2 = 3;
        this.prepareHeight2 = 10;
        this.phase = 1;
        // 地图上单位列表
        this.playerUnits = [];
        this.enemyUnits = [];
        // 操作地块列表
        this.tileList = [];
        // 单位操作队列
        this.unitTurn = [];
        this.playerTroop = [
            {
                name: 'bill',
                type: 'footman',
                att: 15,
                hp: 100,
                def: 4,
                speed: 20,
                skill: []
            }, {
                name: 'Hank',
                type: 'footman',
                att: 15,
                hp: 100,
                def: 10,
                speed: 16,
                skill: []
            }, {
                name: 'William',
                type: 'footman',
                att: 20,
                hp: 100,
                def: 4,
                speed: 15,
                skill: []
            }, {
                name: 'Red',
                type: 'archer',
                att: 18,
                hp: 80,
                def: 2,
                speed: 20,
                skill: []
            }
        ];
        this.enemyTroop = [
            {
                name: 'robber',
                type: 'footman',
                att: 10,
                hp: 100,
                def: 3,
                speed: 35,
                skill: []
            },
            {
                name: 'robber',
                type: 'footman',
                att: 10,
                hp: 100,
                def: 3,
                speed: 33,
                skill: []
            },
            {
                name: 'robber',
                type: 'footman',
                att: 10,
                hp: 100,
                def: 3,
                speed: 31,
                skill: []
            }
        ];
    },
    getTilePos: function(posInPixel) {
        var mapSize = this.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);

        return cc.p(x, y);
    },
    getPixelPos: function (pos) {
        var tileSize = this.tiledMap.getTileSize();
        var mapSize = this.tiledMap.getMapSize();
        return cc.p(pos.x * tileSize.width, (mapSize.height - pos.y) * tileSize.height);
    },
    clearMoveTiles: function () {
        for (var i in this.tileList) {
            this.tileList[i].destroy();
        }
        this.tileList = [];
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
