const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const allLevels = [maps.map1, maps.map2, maps.map3];
let currentLevelIndex = 0;

let maze = new Maze(allLevels[currentLevelIndex], tileSize);
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

function nextLevel() {
    currentLevelIndex++;

    if (currentLevelIndex < allLevels.length) {
        maze = new Maze(allLevels[currentLevelIndex], tileSize);

        const startPos = maze.getStartPos();

        player.gridX = startPos.x;
        player.gridY = startPos.y;
        player.x = startPos.x * tileSize;
        player.y = startPos.y * tileSize;

        canvas.width = maze.cols * tileSize;
        canvas.height = maze.rows * tileSize;

    } else {
        alert("Поздравляем! Вы прошли все уровни!");
        currentLevelIndex = 0; 
        gameLoop();
    }
}

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

    const exit = maze.getExitPos();
    if (player.gridX === exit.x && player.gridY === exit.y) {
        if (player.x === player.gridX * tileSize && player.y === player.gridY * tileSize) {
            nextLevel();
        }
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