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
			let size = canv.width / BOARD_SIZE;
			let x = Math.floor((ev.clientX - bounds.left) / size);
			let y = Math.floor((ev.clientY - bounds.top) / size);

			this.render();

			context = canv.getContext("2d");
			context.fillStyle = "black";
			context.globalAlpha = 0.3;
			context.font = "30px Arial";
			context.fillText(`(${x}, ${y})`, 10, 50);
			context.globalAlpha = 1;
		};
		// TODO Set interval to 10 sec to fetch data from server and render
	},
	entities: [],
	render: function() {
		let size = this.canvas.width / BOARD_SIZE;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.entities.forEach((entity) => {
			this.context.fillStyle = entity.type;
			this.context.fillRect(entity.x * size, entity.y * size, size, size);
		});
	},
};

board.entities.push(new Zord("mroik", 50, 50));
board.entities.push(new Zord("fin", 40, 40));
board.entities.push(new Totem(20, 20));

let redraw = () => {
	let b = document.getElementById("board-game");
	b.remove();
	board.init();
};

window.addEventListener("resize", redraw, false);
