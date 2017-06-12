var Tetris = function (options) {
	// 容器
	this.$playArea = $("#play_area");
	// 右侧方块容器
	this.$playNextType = $("#play_nextType");
	// 开始按钮
	this.$playBtnStart = $("#play_btn_start");
	// 方向
	this.$playDirection = $("#play_direction");

	// 分数
	this.$playScore = $("#play_score");
	// 选择难度按钮
	this.$playBtnLevel = $("#play_btn_level");
	// 难度列表按钮
	this.$playMenuLevel = $("#play_menu_level")

	// 列
	this.cellCol = 15;
	// 行
	this.cellRow = 24;
	// 单元格列表
	this.cellArr = [];
	// 右侧列表
	this.miniCellArr = [];

	// 初始化分数
	this.score = 0;

	// 初始化方格的位置
	this.offsetCol = Math.floor(this.cellCol / 2);
	this.offsetRow = -3;

	// 初始化方向
	this.direction = 'bottom';

	this.turning = false;
	this.playing = false;
	this.death = false;

	// 初始化时间
	this.timer = null;

	this.interval = [600, 300, 100];
	this.level = 1;
	this.levelScore = [10, 20, 40];
	this.doubleScore = [1, 4, 10, 20];

	// 左侧游戏模块列表
	this.tetrisArr = [];
	// 方块
	this.tetrisArr[0] = [
		[0, 1, this.cellCol, this.cellCol + 1],
		[0, 1, this.cellCol, this.cellCol + 1]
	];
	// 左下
	this.tetrisArr[1] = [
		[1, this.cellCol - 1, this.cellCol, this.cellCol + 1],
		[0, this.cellCol, this.cellCol * 2, this.cellCol * 2 + 1],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol * 2 - 1],
		[-1, 0, this.cellCol, this.cellCol * 2]
	];
	// 右下
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
	// 钉子
	this.tetrisArr[5] = [
		[0, this.cellCol - 1, this.cellCol, this.cellCol + 1],
		[0, this.cellCol, this.cellCol + 1, this.cellCol * 2],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol * 2],
		[0, this.cellCol - 1, this.cellCol, this.cellCol * 2]
	];
	// 横竖
	this.tetrisArr[6] = [
		[0, this.cellCol, this.cellCol * 2, this.cellCol * 3],
		[this.cellCol - 1, this.cellCol, this.cellCol + 1, this.cellCol + 2]
	];
	this.tetrisType = [1, 1];
	this.tetrisType = [1, 0];
	// 右侧游戏模块列表
	this.tetrisTypeArr = [];

	// 开始暂停开关
	this.isStart = false;

	this.preTetris = [];
	this.thisTetris = [];

	this.fullArr = [];

	this.start();
};
Tetris.prototype = {
	// 开始
	start: function () {
		this.init();
		this.menu();
		this.control();
	},
	init: function () {
		var that = this, _ele, _miniEle, _arr = [];
		// 绘制游戏左侧面板
		for (var i = 0; i < this.cellRow; i++) {
			for (var j = 0; j < this.cellCol; j++) {
				_ele = document.createElement("div");
				$(_ele).addClass("play_cell").attr("id", "play_cell" + i + "_" + j)
				this.cellArr.push($(_ele));
				this.$playArea.append(_ele);
			}
		}

		// 右侧显示面板
		for (var m = 0; m < 16; m++) {
			_miniEle = document.createElement("div");
			_miniEle.className = "play_mini_cell";
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
	// 从新计算分数
	resetArea: function () {
		$(".play_cell.active").removeClass("active");
		this.setOptions({
			"score": 0
		});
		this.$playScore.html(this.score);
	},
	// 设置游戏等级
	setOptions: function (options) {
		this.score = options.score === 0 ? options.score : (options.score || this.score);
		this.level = options.level === 0 ? options.level : (options.level || this.level);
	},

	// 事件绑定
	menu: function () {
		var that = this;
		// 开始暂停按钮
		this.$playBtnStart.click(function () {
			if (that.playing) {
				that.pause();
			} else if (that.death) {
				that.resetArea();
				that.play();
			} else {
				that.play();
			}
		});

		// 空格事件
		$("html").keydown(function (e) {
			if (e.keyCode == 32) {
				if (this.isStart) {
					that.pause();
					this.isStart = false;
				} else {
					that.play();
					this.isStart = true;
				}
			}
		});
		// 隐藏弹框
		$('.over').click(function () {
			$(this).hide();
		});

		// 关灯
		var $body = $("body");
		$(".guandeng").click(function () {
			if ($body.hasClass("deng")) {
				$body.removeClass("deng");
				$(this).text("关灯")
			} else {
				$body.addClass("deng");
				$(this).text("护眼")
			}
		});

		// 显示等级按钮
		this.$playBtnLevel.click(function () {
			if (that.playing)
				return;
			that.$playMenuLevel.toggle();
		});
		// 选择难度按钮
		that.$playMenuLevel.find("a").click(function () {
			that.$playMenuLevel.hide();
			that.$playBtnLevel.find(".level_text").html($(this).html());
			that.setOptions({
				"level": $(this).attr('level')
			})
		});
	},
	// 暂停状态
	pause: function () {
		this.$playBtnStart.html("开始");
		this.playing = false;
		clearTimeout(this.timer)
	},
	// 开始状态
	play: function () {
		var that = this;
		this.$playBtnStart.html('暂停');
		this.playing = true;
		this.death = false;
		if (this.turning) {
			this.timer = setInterval(function () {
				that.offsetRow++;
				that.showTetris();
			}, this.interval[this.level]);
		} else {
			this.nextTetris();
		}
	},
	// 右侧显示下一个方块
	showNextType: function () {
		var _nt = this.tetrisArr[this.nextType[0]][this.nextType[1]],
			_ele,
			_index;
		this.$playNextType.find(".active").removeClass("active");
		for (var i = 0, iLen = _nt.length; i < iLen; i++) {
			if (_nt[i] > this.cellCol - 2) {
				_index = (_nt[i] + 2) % this.cellCol - 2 + 1 + 4 * parseInt((_nt[i] + 2) / this.cellCol)
			} else {
				_index = _nt[i] + 1;
			}
			_ele = this.miniCellArr[_index];
			_ele.addClass("active");
		}
	},

	// 遥控器
	drive: function () {
		switch (this.direction) {
			case 'left':
				if (this.offsetCol > 0)
					this.offsetCol--;
				break;
			case 'right':
				this.offsetCol++;
				break;
			case 'top':
				this.changTetris();
				break;
			case 'bottom':
				if (this.offsetRow < this.cellRow - 2)
					this.offsetRow++;
				break;
			default:
				break;
		}
		this.showTetris(this.direction);
	},

	// 上方向箭头 变形
	changTetris: function () {
		var _len = this.tetrisArr[this.tetrisType[0]].length;
		if (this.tetrisType[1] < _len - 1) {
			this.tetrisType[1]++;
		} else {
			this.tetrisType[1] = 0;
		}
	},

	// 键盘控制
	control: function () {
		var that = this;
		$('html').keydown(function (e) {
			if (!that.playing)
				return that.playing;
			switch (e.keyCode) {
				case 37:
					that.direction = 'left';
					break;
				case 38:
					that.direction = 'top';
					break;
				case 39:
					that.direction = 'right';
					break;
				case 40:
					that.direction = 'bottom';
					break;
				default:
					return;
					break;
			}
			that.$playDirection.html(that.direction);
			that.drive();
			return false;

		})
	},
	// 游戏面板方块
	showTetris: function (dir) {
		var _tt = this.tetrisArr[this.tetrisType[0]][this.tetrisType[1]],
			_ele,
			that = this;
		this.turning = true;
		this.thisTetris = [];
		for (var i = _tt.length - 1; i >= 0; i--) {
			_ele = this.cellArr[_tt[i] + this.offsetCol + this.offsetRow * this.cellCol];
			//
			if (this.offsetCol < 7 && (_tt[i] + this.offsetCol + 1) % this.cellCol == 0) {
				this.offsetCol++;
				return;
			} else if (this.offsetCol > 7 && (_tt[i] + this.offsetCol) % this.cellCol == 0) {
				this.offsetCol--;
				return;
			}
			if (_ele && _ele.hasClass("active") && dir == 'left' && ($.inArray(_ele, this.preTetris) < 0)) {
				if (($.inArray(_ele, this.cellArr) - $.inArray(this.preTetris[i], this.cellArr)) % this.cellCol != 0) {
					this.offsetCol++;
					return;
				}
			}
			if (_ele && _ele.hasClass("active") && dir == "right" && ($.inArray(_ele, this.preTetris) < 0)) {
				if (($.inArray(_ele, this.cellArr) - $.inArray(this.preTetris[i], this.cellArr)) % this.cellCol != 0) {
					this.offsetCol--;
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

	// 游戏面板方块落下方法
	tetrisDown: function () {
		clearInterval(this.timer);
		var _index;
		this.turning = false;
		forOuter: for (var j = 0, jLen = this.preTetris.length; j < jLen; j++) {
			_index = $.inArray(this.preTetris[j], this.cellArr);
			for (var k = _index - _index % this.cellCol, kLen = _index - _index % this.cellCol + this.cellCol; k < kLen; k++) {
				if (!this.cellArr[k].hasClass("active")) {
					continue forOuter;
				}
			}
			if ($.inArray(_index - _index % this.cellCol, this.fullArr) < 0)
				this.fullArr.push(_index - _index % this.cellCol);
		}
		if (this.fullArr.length) {
			this.getScore();
			return;
		}
		for (var i = 6; i < 9; i++) {
			if (this.cellArr[i].hasClass("active")) {
				this.gameOver();
				return;
			}
		}
		this.nextTetris();
	},

	// 下一个方块就位游戏面板
	nextTetris: function () {
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
	},

	// 游戏结束
	gameOver: function () {
		this.death = true;
		this.pause();
		$('.over').show();
		return;
	},

	// 计算分数
	getScore: function () {
		for (var i = this.fullArr.length - 1; i >= 0; i--) {
			for (var j = 0; j < this.cellCol; j++) {
				this.cellArr[j + this.fullArr[i]].removeClass("active");
				if (j == this.cellCol - 1) {
					for (var k = this.fullArr[i]; k >= 0; k--) {
						if (this.cellArr[k].hasClass("active")) {
							this.cellArr[k].removeClass("active");
							this.cellArr[k + this.cellCol].addClass("active");
						}
					}
				}
			}
		}
		this.score += this.levelScore[this.level] * this.doubleScore[this.fullArr.length - 1];
		this.$playScore.html(this.score);
		this.fullArr = [];
		this.nextTetris();
	}

};
$(function () {
	var t = new Tetris();
});
