const BASE_URL = "http://127.0.0.1:6969";
const BOARD_SIZE = 140;
const COUNTER = 10;
enum EntityType {
	Zord = "red",
	Totem = "green",
}

class Entity {
	private x: number;
	private y: number;

	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public getX() {
		return this.x;
	}

	public getY() {
		return this.y;
	}
}

class Zord extends Entity {
	private player: string;
	private shield: number;
	private range: number;
	private hp: number;

	public constructor(player: string, x: number, y: number, shield: number, range: number, hp: number) {
		super(x, y);
		this.player = player;
		this.shield = shield;
		this.range = range;
		this.hp = hp;
	}

    public getPlayer() {
		return this.player;
    }

    public getHp() {
		return this.hp;
    }

    public getRange() {
		return this.range;
    }

    public getShields() {
		return this.shield;
    }
}

class Totem extends Entity {
	public constructor(x: number, y: number) {
		super(x, y);
	}
}

class Game {
	private multiplier: number;
	private canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;
	private currentX: number;
	private currentY: number;
	private entities: Array<Entity>;
	private dragging: boolean;
	private boardOffsetX: number;
	private boardOffsetY: number;
	private fetchCounter: number;
	private username: string | null;
	private token: string | null;

	public constructor() {
		this.dragging = false;
		this.entities = [];
		this.multiplier = 1;
		this.currentX = 0;
		this.currentY = 0;
		this.boardOffsetX = 0;
		this.boardOffsetY = 0;
		this.fetchCounter = COUNTER;
		this.username = null;
		this.token = null;

		let paren = document.getElementById("board-slot") as HTMLDivElement;
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("style", "border: 1px solid black");
		this.canvas.setAttribute("id", "board-game");
		paren.appendChild(this.canvas);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight - 100;
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.canvas.onmousemove = (ev: MouseEvent) => {
			let bounds = this.canvas.getBoundingClientRect();
			let size = this.edgeLength() / BOARD_SIZE;
			this.currentX = Math.floor((ev.clientX - bounds.left - this.boardOffsetX) / size);
			this.currentY = Math.floor((ev.clientY - bounds.top - this.boardOffsetY) / size);
			this.updateInfo();
			this.render();
		};
	}

    public render() {
		let size = this.edgeLength() / BOARD_SIZE;
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.beginPath();
		this.context.globalAlpha = 0.05;
		for(let i = 0; i < BOARD_SIZE + 1; i++) {
			this.context.moveTo(i * size + this.boardOffsetX, this.boardOffsetY);
			this.context.lineTo(i * size + this.boardOffsetX, BOARD_SIZE * size + this.boardOffsetY);

			this.context.moveTo(this.boardOffsetX, i * size + this.boardOffsetY);
			this.context.lineTo(BOARD_SIZE * size + this.boardOffsetX, i * size + this.boardOffsetY);
		}
		this.context.stroke();
		this.context.globalAlpha = 1;

		this.entities.forEach(entity => {
			if(entity instanceof Zord && (entity as Zord).getPlayer() == this.username) {
				this.context.fillStyle = "blue";
			} else if(entity instanceof Zord) {
				this.context.fillStyle = EntityType.Zord;
			} else {
				this.context.fillStyle = EntityType.Totem;
			}
			this.context.fillRect(entity.getX() * size + this.boardOffsetX, entity.getY() * size + this.boardOffsetY, size, size);
		});

		this.context.fillStyle = "black";
		this.context.globalAlpha = 0.2;
		this.context.font = "30px Arial";
		this.context.fillText(`(${this.currentX}, ${this.currentY})`, 10, 50);
		this.context.fillText(`${this.fetchCounter}`, 600, 50);
		this.context.globalAlpha = 1;
    }

    private updateInfo() {
		let info = document.getElementById("info") as HTMLTableElement;
		let data = this.entities.find(entity => {
			return (entity instanceof Zord && entity.getX() == this.currentX && entity.getY() == this.currentY);
		}) as Zord;
		if(data) {
			let base = Object.keys(data);
			let first = base.map(k => `<td>${k}</td>`).join("");
			let second = [
				`${data.getX()}`,
				`${data.getY()}`,
				`${data.getPlayer()}`,
				`${data.getShields()}`,
				`${data.getRange()}`,
				`${data.getHp()}`,
			].map(d => `<td>${d}</td>`).join("");
			info.innerHTML = `<tr>${first}</tr><tr>${second}</tr>`;
		}
    }

    private edgeLength() {
		return this.canvas.width * this.multiplier;
    }

	public getMapData() {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/map");
		xhr.send();
		xhr.responseType = "json";
		xhr.onload = () => {
			const data = xhr.response.map;
			this.entities = [];
			data.forEach((e: any) => {
				if(e.zord) {
					this.entities.push(new Zord(
						e.zord.owner,
						e.zord.x,
						e.zord.y,
						e.zord.shields,
						e.zord.range,
						e.zord.hp
					));
				} else if(e.totem) {
					this.entities.push(new Totem(e.totem.x, e.totem.y));
				}
			});
			this.fetchCounter = 10;
		};
	}

	public getLeaderboard() {
		const xhr = new XMLHttpRequest();
		xhr.open("POST", BASE_URL + "/leaderboard");
		xhr.send();
		xhr.responseType = "json";
		xhr.onload = () => {
			const data = xhr.response.leaderboard;
			let lead = data
				.map((player: any) => `<tr><td>${player.name}</td><td>${player.points}</td><td>${player.actions}</td></tr>`)
				.join("");
			let paren = document.getElementById("leaderboard") as HTMLTableElement;
			paren.innerHTML = "<tr><td>Name</td><td>Points</td><td>Actions</td>" + lead;
		};
	}

	public decreaseMultiplier(m: number) {
		this.multiplier -= m;
	}
	
	public setDragging(d: boolean) {
		this.dragging = d;
	}

	public isDragging() {
		return this.dragging;
	}

    public addBoardOffsetX(movementX: number) {
		this.boardOffsetX += movementX;
    }

    public addBoardOffsetY(movementY: number) {
		this.boardOffsetY += movementY;
    }

    public decreaseCounter() {
		this.fetchCounter -= 1;
    }

    public getCounter() {
		return this.fetchCounter;
    }

    public resetCounter() {
		this.fetchCounter = COUNTER;
    }

    public addCanvasListener(event: string, callable: (ev: any) => void) {
		this.canvas.addEventListener(event, callable, false);
    }

    public setToken(tok: string) {
		this.token = tok;
    }
    public setUsername(user: string) {
		this.username = user;
    }
}

let game: Game;

// Events
let zoom = (ev: WheelEvent) => {
	ev.preventDefault();
	ev.stopPropagation();
	game.decreaseMultiplier(ev.deltaY * 0.0005);
	game.render();
};

let startDragging = (_: any) => {
	game.setDragging(true);
};

let stopDragging = (_: any) => {
	game.setDragging(false);
};

let dragBoard = (ev: MouseEvent) => {
	if(!game.isDragging()) {
		return;
	}
	game.addBoardOffsetX(ev.movementX);
	game.addBoardOffsetY(ev.movementY);
	game.render();
};

let fetchingCounter = () => {
	game.decreaseCounter();
	if(game.getCounter() <= 0) {
		game.resetCounter();
		game.getMapData();
		game.getLeaderboard();
	}
	game.render();
};

window.onload = () => {
	game = new Game();
	game.addCanvasListener("wheel", zoom);
	game.addCanvasListener("mousedown", startDragging);
	game.addCanvasListener("mouseup", stopDragging);
	game.addCanvasListener("mouseout", stopDragging);
	game.addCanvasListener("mousemove", dragBoard);

	let login = document.getElementById("login") as HTMLButtonElement;
	login.onclick = (_) => {
		let user = document.getElementById("username") as HTMLInputElement;
		let token = document.getElementById("token") as HTMLInputElement;
		game.setUsername(user.value.trim());
		game.setToken(token.value.trim());
		user.value = "";
		token.value = "";
		game.render();
	};
	setInterval(fetchingCounter, 1000);
	game.render();
};