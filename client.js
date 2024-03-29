const BASE_URL = "http://127.0.0.1:6969"
const EntityType = {
	Zord: "red",
	Totem: "green",
}
const BOARD_SIZE = 140;

function Zord(player, x, y, shield, range, hp) {
	this.type = EntityType.Zord;
	this.player = player;
	this.x = x;
	this.y = y;
	this.shield = shield;
	this.range = range;
	this.hp = hp;
}

function Totem(x, y) {
	this.type = EntityType.Totem;
	this.x = x;
	this.y = y;
}

let board = {
	multiplier: 1,
	canvas: null,
	init: function() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		if(this.canvas.width < this.canvas.height) {
			this.canvas.height -= 130;
		} else {
			this.canvas.width -= 130;
		}
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);

		// Show coord on canvas
		canv = this.canvas;
		this.canvas.onmousemove = (ev) => {
			let bounds = canv.getBoundingClientRect();
			let size = this.edgeLength() / BOARD_SIZE;
			this.x = Math.floor((ev.clientX - bounds.left - this.boardOffsetX) / size);
			this.y = Math.floor((ev.clientY - bounds.top - this.boardOffsetY) / size);

			this.render();
		};
	},
	x: 0,
	y: 0,
	entities: [],
	render: function() {
		let size = this.edgeLength() / BOARD_SIZE;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.beginPath();
		this.context.globalAlpha = 0.05;
		for(let i = 0; i < BOARD_SIZE + 1; i++) {
			this.context.moveTo(i * size + this.boardOffsetX, 0 + this.boardOffsetY);
			this.context.lineTo(i * size + this.boardOffsetX, BOARD_SIZE * size + this.boardOffsetY);

			this.context.moveTo(0 + this.boardOffsetX, i * size + this.boardOffsetY);
			this.context.lineTo(BOARD_SIZE * size + this.boardOffsetX, i * size + this.boardOffsetY);
		}
		this.context.stroke();
		this.context.globalAlpha = 1;

		this.entities.forEach((entity) => {
			this.context.fillStyle = entity.type;
			this.context.fillRect(entity.x * size + this.boardOffsetX, entity.y * size + this.boardOffsetY, size, size);
		});
		this.context.fillStyle = "black";
		this.context.globalAlpha = 0.2;
		this.context.font = "30px Arial";
		this.context.fillText(`(${this.x}, ${this.y})`, 10, 50);
		this.context.fillText(this.fetchCounter , 600, 50);
		this.context.globalAlpha = 1;
	},
	edgeLength: function() {
		return this.canvas.width * this.multiplier;
	},
	isDragging: false,
	boardOffsetX: 0,
	boardOffsetY: 0,
	getMapData: function() {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/map");
		xhr.send();
		xhr.responseType = "json";
		xhr.onload = () => {
			const data = xhr.response.map;
			this.entities = [];
			data.forEach(e => {
				if(e.zord) {
					this.entities.push(new Zord(
						e.zord.owner,
						e.zord.x,
						e.zord.y,
						e.zord.shield,
						e.zord.increase,
						e.zord.hp
					));
				} else if(e.totem) {
					this.entities.push(new Totem(e.totem.x, e.totem.y));
				}
			});
			this.fetchCounter = 10;
		};
	},
	fetchCounter: 10,
};

// Events
let redraw = () => {
	let b = document.getElementById("board-game");
	b.remove();
	board.init();
	board.render();
};
let zoom = (ev) => {
	ev.preventDefault();
	ev.stopPropagation();
	board.multiplier -= ev.deltaY * 0.001;
	board.render();
};
let startDragging = (_) => {
	board.isDragging = true;
};
let stopDragging = (_) => {
	board.isDragging = false;
};
let dragBoard = (ev) => {
	if(!board.isDragging) {
		return;
	}
	board.boardOffsetX += ev.movementX;
	board.boardOffsetY += ev.movementY;
	board.render();
};

function generateCanvas() {
	let paren = document.getElementById("board-slot");
	let canv = document.createElement("canvas");
	canv.setAttribute("style", "border: 1px solid black");
	paren.appendChild(canv);
	canv.setAttribute("id", "board-game");
	return canv;
}

window.onload = () => {
	window.addEventListener("resize", redraw, false);
	board.canvas.addEventListener("wheel", zoom, false);
	board.canvas.addEventListener("mousedown", startDragging, false);
	board.canvas.addEventListener("mouseup", stopDragging, false);
	board.canvas.addEventListener("mouseout", stopDragging, false);
	board.canvas.addEventListener("mousemove", dragBoard, false);
	setInterval(() => {
		board.fetchCounter--;
		if(board.fetchCounter <= 0) {
			board.fetchCounter = 10;
			board.getMapData();
		}
		board.render();
	}, 1000);
	board.init();
	board.render();
};
