const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const allLevels = [maps.map1, maps.map2, maps.map3];
let currentLevelIndex = 0;
let enemies = [];

let maze = new Maze(allLevels[currentLevelIndex], tileSize);
loadEnemies(currentLevelIndex);
const startPos = maze.getStartPos();
const exitPos = maze.getExitPos();

function loadEnemies(levelIndex) {
    const levelKey = "map" + (levelIndex + 1);
    enemies = []; // Очищаем список врагов текущего уровня
    
    if (enemiesData[levelKey]) {
        enemiesData[levelKey].forEach(data => {
            enemies.push(new Enemy(data.x, data.y, data.tileSize, data.path));
        });
    }
}


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
        loadEnemies(currentLevelIndex);
        
        const startPos = maze.getStartPos();

        player.gridX = startPos.x;
        player.gridY = startPos.y;
        player.x = startPos.x * tileSize;
        player.y = startPos.y * tileSize;

        canvas.width = maze.cols * tileSize;
        canvas.height = maze.rows * tileSize;

    } else {
        alert("Поздравляю! Вы прошли игру!");
        currentLevelIndex = 0; 
    }
}


function update() {
    // упаравление | kierowanie
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"] || keys["ц"]) dy = -1;
    else if (keys["s"] || keys["arrowdown"] || keys["ы"]) dy = 1;
    else if (keys["a"] || keys["arrowleft"] || keys["ф"]) dx = -1;
    else if (keys["d"] || keys["arrowright"] || keys["в"]) dx = 1;

    if (dx !== 0 || dy !== 0) {
        player.move(dx, dy, maze);
    }

    // Появление противников | pojawienie przeciwników
    enemies.forEach(enemy => {
        enemy.update(player, maze);
    });

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
    enemies.forEach(enemy => {
        enemy.draw(ctx);
    });

    requestAnimationFrame(gameLoop); 
}


gameLoop();