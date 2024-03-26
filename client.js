const EntityType = {
	Zord: "red",
	Totem: "green",
}
const BOARD_SIZE = 140;

function Zord(player, x, y) {
	this.type = EntityType.Zord;
	this.player = player;
	this.x = x;
	this.y = y;
}

function Totem(x, y) {
	this.type = EntityType.Totem;
	this.x = x;
	this.y = y;
}

let board = {
	multiplier: 1,
	canvas: function() {
		let canv = document.createElement("canvas");
		canv.setAttribute("id", "board-game");
		return canv;
	}(),
	init: function() {
		let size = window.innerWidth;
		if(window.innerHeight < window.innerWidth) {
			size = innerHeight;
		}
		size -= 50;

		this.canvas.width = size;
		this.canvas.height = size;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);

		// Show coord on canvas
		canv = this.canvas;
		this.canvas.onmousemove = (ev) => {
			let bounds = canv.getBoundingClientRect();
			let size = this.edgeLength() / BOARD_SIZE;
			let x = Math.floor((ev.clientX - bounds.left) / size);
			let y = Math.floor((ev.clientY - bounds.top) / size);

			this.render();

			context = canv.getContext("2d");
			context.fillStyle = "black";
			context.globalAlpha = 0.2;
			context.font = "30px Arial";
			context.fillText(`(${x}, ${y})`, 10, 50);
			context.globalAlpha = 1;
		};
		// TODO Set interval to 10 sec to fetch data from server and render
	},
	entities: [],
	render: function() {
		let size = this.edgeLength() / BOARD_SIZE;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.beginPath();
		this.context.globalAlpha = 0.05;
		for(let i = 0; i < BOARD_SIZE; i++) {
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
	},
	edgeLength: function() {
		return this.canvas.width * this.multiplier;
	},
	isDragging: false,
	boardOffsetX: 0,
	boardOffsetY: 0,
};

board.entities.push(new Zord("mroik", 50, 50));
board.entities.push(new Zord("fin", 40, 40));
board.entities.push(new Totem(20, 20));

// Events
let redraw = () => {
	let b = document.getElementById("board-game");
	b.remove();
	board.init();
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

window.onload = () => {
	window.addEventListener("resize", redraw, false);
	board.canvas.addEventListener("wheel", zoom, false);
	board.canvas.addEventListener("mousedown", startDragging, false);
	board.canvas.addEventListener("mouseup", stopDragging, false);
	board.canvas.addEventListener("mouseout", stopDragging, false);
	board.canvas.addEventListener("mousemove", dragBoard, false);
	board.init();
	board.render();
};
