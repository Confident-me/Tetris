/**
 * Created by 巩建鹏 on 2017/6/9.
 */
var Tetris = function () {
	// 左侧容器
	this.$playArea = $("#play_area");
	// 右侧容器
	this.$playNextType = $("#play_nextType");
	// 行
	this.cellRow = 24;
	// 列
	this.cellCol = 15;
	// 存储左侧单元格列表
	this.cellArr = [];
	// 存储右侧单元格列表
	this.miniCellArr = [];
	// 右侧方块列表
	this.tetrisTypeArr = [];
	// 左侧方块列表
	this.preTetris = [];
	// 俄罗斯方块列表
	this.tetrisArr = [];
	// 方块
	this.tetrisArr[0] = [
		[0, 1, this.cellCol, this.cellCol + 1],
		[0, 1, this.cellCol, this.cellCol + 1]
	];
	// 7
	this.tetrisArr[1] = [
		[1, this.cellCol - 1, this.cellCol, this.cellCol + 1],
		[0, this.cellCol, this.cellCol * 2, this.cellCol * 2 + 1],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol * 2 - 1],
		[-1, 0, this.cellCol, this.cellCol * 2]
	];
	// 『
	this.tetrisArr[2] = [
		[-1, this.cellCol - 1, this.cellCol, this.cellCol + 1],
		[0, 1, this.cellCol, this.cellCol * 2],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol * 2 + 1],
		[0, this.cellCol, this.cellCol * 2 - 1, this.cellCol * 2]
	];
	// 反Z
	this.tetrisArr[3] = [
		[0, this.cellCol, this.cellCol + 1, this.cellCol * 2 + 1],
		[this.cellCol, this.cellCol + 1, this.cellCol * 2 - 1, this.cellCol * 2]
	];
	// Z
	this.tetrisArr[4] = [
		[0, this.cellCol - 1, this.cellCol, this.cellCol * 2 - 1],
		[this.cellCol - 1, this.cellCol, this.cellCol * 2, this.cellCol * 2 + 1]
	];
	// ┫
	this.tetrisArr[5] = [
		[0, this.cellCol - 1, this.cellCol, this.cellCol + 1],
		[0, this.cellCol, this.cellCol + 1, this.cellCol * 2],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol * 2],
		[0, this.cellCol - 1, this.cellCol, this.cellCol * 2]
	];
	// 一
	this.tetrisArr[6] = [
		[0, this.cellCol, this.cellCol * 2, this.cellCol * 3],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol + 2]
	];

	// 初始化时间
	this.timer = null;
	/**
	 * 时间毫秒数
	 * 600 初级
	 * 300 中级
	 * 100 困难
	 * @type {number[]}
	 */
	this.interval = [600, 300, 100];
	// 等级下标
	this.level = 1;
	/**
	 * 消除1格 10分
	 * 消除2格 20分
	 * 消除3格及以上 40分
	 * @type {number[]}
	 */
	this.levelScore = [10, 20, 40];
	/**
	 * 得分倍数
	 * @type {number[]}
	 */
	this.doubleScore = [1, 4, 10, 20];

	// 初始化形状
	//this.tetrisType = [1, 1];
	this.tetrisType = [1, 0];

	// 是否显示下一个方块
	this.turning = true;

	// 左侧面板方块列表
	this.thisTetris = [];

	// 初始化方格在左侧面板的位置
	this.offsetCol = Math.floor(this.cellCol / 2);
	this.offsetRow = -3;


	this.start();
};

Tetris.prototype = {
	// 开始按钮
	start: function () {
		this.init();
		this.showTetris();
	},
	init: function () {
		var that = this,
			_ele,
			_miniEle;
		// 绘制左侧面板
		for (var i = 0; i < this.cellRow; i++) {
			for (var j = 0; j < this.cellCol; j++) {
				_ele = document.createElement("div"); // 创建一个新节点
				$(_ele).addClass("play_cell").attr("id", "play_cell" + i + "_" + j); // 添加class ID
				this.cellArr.push($(_ele)); // 把每一个单元格追加到列表
				this.$playArea.append(_ele); // 把每一个单元格追加到DOM元素里
			}
		}

		// 绘制右侧面板
		for (var m = 0; m < 16; m++) {
			_miniEle = document.createElement("div");
			$(_miniEle).addClass("play_mini_cell");
			this.miniCellArr.push($(_miniEle));
			this.$playNextType.append(_miniEle);
		}
		// 右侧所有方块列表
		for (var k = 0, kLen = this.tetrisArr.length; k < kLen; k++) {
			for (var mk = 0, mkLen = this.tetrisArr[k].length; mk < mkLen; mk++) {
				this.tetrisTypeArr.push([k, mk]);
			}
		}

		// 随机算出下一个俄罗斯方块
		this.nextType = this.tetrisTypeArr[Math.floor(this.tetrisTypeArr.length * Math.random())];

		this.showNextType();
	},
	// 显示右侧方块
	showNextType: function () {
		var _nt = this.tetrisArr[this.nextType[0]][this.nextType[1]], // 存储方块的4个坐标
			_ele,
			_index;
		this.$playNextType.find(".active").removeClass("active");
		// 循环方块的坐标
		for (var i = 0, iLen = _nt.length; i < iLen; i++) {
			// 如果方块的坐标大于容器的列-2，那么此坐标+2 再%容器列-2+1+4*（此坐标+2/容器的列）
			if (_nt[i] > this.cellCol - 2) {
				_index = (_nt[i] + 2) % this.cellCol - 1 + 4 * parseInt((_nt[i] + 2) / this.cellCol);
			} else {
				// 坐标+1
				_index = _nt[i] + 1;
			}
			_ele = this.miniCellArr[_index];	// 把坐标存储到小(右)容器列表
			_ele.addClass("active"); // 给存储的坐标单元格添加样式
		}
	},
	// 左侧下一个方块
	/*nextTetris: function () {
	 var that = this;
	 clearInterval(this.timer);
	 this.preTetris = [];
	 this.offsetRow = -2;
	 this.offsetCol = 7;
	 this.tetrisType = this.nextType;
	 this.nextType = this.tetrisTypeArr[Math.floor(this.tetrisTypeArr.length * Math.random())];
	 this.showNextType();
	 this.timer = setInterval(function () {
	 that.offsetRow++;
	 that.showTetris();
	 }, this.interval[this.level])
	 },*/
	/**
	 * 方块在左侧面板的位置
	 * @param dir 方向
	 */
	showTetris: function (dir) {
		// 方块在左侧下落时的坐标
		var _tt = this.tetrisArr[this.tetrisType[0]][this.tetrisType[1]],
			_ele;
		this.turning = true;
		this.thisTetris = [];
		for (var i = _tt.length - 1; i >= 0; i--) {
			// 存储下落方块的坐标
			_ele = this.cellArr[_tt[i] + this.offsetCol + this.offsetRow * this.cellCol];
			// 如果方块纵坐标位置<7，&&方块的坐标+自身纵坐标的位置+1 % 所有列 == 0
			if (this.offsetCol < 7 && (_tt[i] + this.offsetCol + 1) % this.cellCol == 0) {
				// 自身纵坐标位置++
				this.offsetCol++;
				return;
			} else if (this.offsetCol > 7 && (_tt[i] + this.offsetCol) % this.cellCol == 0) { // 相反--
				this.offsetCol--;
				return;
			}
			// 如果有方块 && class='active' && 方向=='left' && 方块列表 没有 _ele
			if (_ele && _ele.hasClass("active") && dir == 'left' && ($.inArray(_ele, this.preTetris) < 0)) {
				// 如果单元格列表_ele - 单元格列表方块里的方块 % 所有列 != 0;
				if (($.inArray(_ele, this.cellArr) - $.inArray(this.preTetris[i], this.cellArr)) % this.cellCol != 0) {
					this.offsetCol++;
					return;
				}
			}
			if (_ele) {
				if (_ele.hasClass("active") && ($.inArray(_ele, this.preTetris) < 0)) {
					this.tetrisDown();
					return;
				} else {
					this.thisTetris.push(_ele);
				}
			} else if (this.offsetRow > 0) {
				this.tetrisDown();
				return;
			}
		}
		for (var j = 0, jLen = this.preTetris.length; j < jLen; j++) {
			this.preTetris[j].removeClass("active");
		}
		for (var k = 0, kLen = this.thisTetris.length; k < kLen; k++) {
			this.thisTetris[k].addClass("active");
		}
		this.preTetris = this.thisTetris.slice(0);
	},
	// 左侧方块下落
	/*tetrisDown: function () {
	 clearInterval(this.timer);
	 var _index;
	 this.turning = false;
	 forOuter: for (var j = 0, jLen = this.preTetris.length; j < jLen; j++) {

	 }
	 }*/

};
$(function () {
	var t = new Tetris();
});