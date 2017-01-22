function Astar (mapBlockLayer, mapWidth, mapHeight) {
    var that = this;
    var openList = [];
    var closeList = [];
    var moveCost = 10;
    var blocks = []; // blockList是二维数组，标记所有障碍物
    var width = mapWidth;
    var height = mapHeight;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.search = function (start, end, unitBlockList, range) {
        var x1 = start.x;
        var y1 = start.y;
        var x2 = end.x;
        var y2 = end.y;
        var startNode = {
            x: x1,
            y: y1,
            G: 0
        }
        openList = [];
        closeList = [];
        if (x1 < 0 || x1 >= width || x2 <0 || x2 > width - 1 || y1 < 0 || y1 > height - 1 || y2 < 0 || y2 > height - 1) {
            return false;
        }
        openList.push(startNode);
        var resultList = search(start, end, unitBlockList, range);
        if (resultList.length === 0) {
            console.log('no path')
            return false;
        }
        return resultList;
    }
    function search(start, end, unitBlockList, range) {
        blocks = [];
        for (var i in unitBlockList) {
            blocks = blocks.concat(unitBlockList[i]);
        }
        var resultList = [];
        var node;
        var isFind = false;
        while (openList.length > 0) {
            node = openList[0];
            if (node.x === end.x && node.y === end.y) {
                isFind = true;
                break;
            }
            if (node.y - 1 >= 0) {
                checkPath(cc.p(node.x, node.y - 1), node, start, end, moveCost, range);
            }
            if (node.y + 1 < height) {
                checkPath(cc.p(node.x, node.y + 1), node, start, end, moveCost, range);
            }
            if (node.x - 1 >= 0) {
                checkPath(cc.p(node.x - 1, node.y), node, start, end, moveCost, range);
            }
            if (node.x + 1 < width) {
                checkPath(cc.p(node.x + 1, node.y), node, start, end, moveCost, range);
            }
            closeList.push(openList.shift());
            openList.sort(function (a, b) {
                return a.F - b.F;
            });
            
        }
        if (isFind) {
            getPath(resultList, node);
        }
        return resultList;
    }
    function checkPath (pos, parent, start, end, cost, range) {
        var node = {
            x: pos.x,
            y: pos.y,
            parent: parent,
            end: end
        };
        if (range && (Math.abs(node.x - start.x) > range || Math.abs(node.y - start.y) > range)) {
            return false;
        }
        if(!checkBlock(pos)) {
            closeList.push(node);
            return;
        }
        for (var i in closeList) {
            if (closeList[i].x === node.x && closeList[i].y === node.y) {
                return false;
            }
        }
        var inOpenList = false;
        for (var i in openList) {
            if (openList[i].x === node.x && openList[i].y === node.y) {
                inOpenList = true;
                if (openList[i].G > node.parent.G + cost) {
                    count(node);
                    openList[i] = node;
                }
            }
        }
        if (!inOpenList) {
            count(node);
            openList.push(node);
        }
        return true;
    }
    function getPath(resultList, node) {
        if(node.parent){
            getPath(resultList, node.parent);
        }
        resultList.push(node);
    }
    function count (node) {
        node.G = Number(node.parent.G) + moveCost;
        node.H = Math.abs(node.end.x - node.x) + Math.abs(node.end.y - node.y);
        node.F = Number(node.G) + Number(node.H);
    }
    function checkBlock (pos) {
        for (var i in blocks) {
            if (pos.x === blocks[i].x && pos.y === blocks[i].y) {
                return false;
            }
        }
        if (pos.x >= that.mapWidth || pos.y >= that.mapHeight || pos.x < 0 || pos.y < 0) {
            return false;
        }
        if (mapBlockLayer.getTileGIDAt(pos)) {
            return false;
        }
        return true;
    }
}
module.exports = Astar;
