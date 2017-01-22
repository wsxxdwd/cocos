cc.Class({
    extends: cc.Component,

    properties: {
        greenRound: {
            default: null,
            type: cc.Prefab
        },
        redRound: {
            default: null,
            type: cc.Prefab
        }
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        this.node.on('actionBarStart', function (event) {
          that.initBar(event.detail.playerUnits, event.detail.enemyUnits);
          that.startAction();
        });
    },
    initBar: function (playerUnits, enemyUnits) {
        var round;
        var i;
        var that = this;
        this.playerUnits = playerUnits;
        this.enemyUnits = enemyUnits;
        this.rounds = [];
        for (i in playerUnits) {
            round = cc.instantiate(this.greenRound);
            this.node.addChild(round);
            round.setPosition(cc.p(-(this.node.width / 2), 0));
            round.id = playerUnits[i].id;
            round.speed = playerUnits[i].unit.speed;
            this.rounds.push(round);
        }
        for (i in enemyUnits) {
            round = cc.instantiate(this.redRound);
            this.node.addChild(round);
            round.setPosition(cc.p(-(this.node.width / 2), 0));
            round.id = enemyUnits[i].id;
            round.speed = enemyUnits[i].unit.speed;
            this.rounds.push(round);
        }
        that.roundsRun = function() {
            for (var i in that.rounds) {
                that.rounds[i].x += that.rounds[i].speed;
                if (that.rounds[i].x >= 400) {
                    this.game.unitTurn.push(that.rounds[i].id);
                    that.stopAction();
                }
            }
        }
    },
    clearProgress: function (id) {
        for (var i in this.rounds) {
            if (this.rounds[i].id === id) {
                this.rounds[i].x = -400;
            }
        }
    },
    startAction: function () {
        this.schedule(this.roundsRun, 0.05);
    },
    stopAction: function () {
        this.unschedule(this.roundsRun);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
