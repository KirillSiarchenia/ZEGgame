const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const maze = new Maze(maps.map1, tileSize);
const startPos = maze.getStartPos();
const exitPos = maze.getExitPos();

canvas.width = maze.cols * tileSize;
canvas.height = maze.rows * tileSize;

const player = new Player(startPos.x, startPos.y, tileSize);

// зажата ли клавиша | czy przycisk jest wciśnięty
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function update() {
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"] || keys["ц"]) dy = -1;
    else if (keys["s"] || keys["arrowdown"] || keys["ы"]) dy = 1;
    else if (keys["a"] || keys["arrowleft"] || keys["ф"]) dx = -1;
    else if (keys["d"] || keys["arrowright"] || keys["в"]) dx = 1;

    if (dx !== 0 || dy !== 0) {
        player.move(dx, dy, maze);
    }
}

function gameLoop() {
    update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    maze.draw(ctx);
    player.draw(ctx);

    requestAnimationFrame(gameLoop); 
}


gameLoop();