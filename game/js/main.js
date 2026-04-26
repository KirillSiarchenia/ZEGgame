const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const allLevels = [maps.map1, maps.map2, maps.map3];
let currentLevelIndex = 0;
let enemies = [];
canvas.width = 1280;
canvas.height = 720;
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



const player = new Player(startPos.x, startPos.y, tileSize);
const camera = new Camera(canvas.width, canvas.height, maze.cols * tileSize, maze.rows * tileSize);

// зажата ли клавиша | czy przycisk jest wciśnięty
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (typeof camera !== 'undefined') {
        camera.width = canvas.width;
        camera.height = canvas.height;
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

        camera.mapWidth = maze.cols * tileSize;
        camera.mapHeight = maze.rows * tileSize;
        camera.focusOn(player.x, player.y);
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
        player.move(dx, dy, maze, enemies);
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

    if (player.hp !== UI.lastHp) {
        UI.updateHealth(player.hp);
        UI.lastHp = player.hp;
    }
}

function gameLoop() {
    update(); 

    camera.update(player.x, player.y);

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    camera.apply(ctx);

    maze.draw(ctx);
    player.draw(ctx);
    enemies.forEach(enemy => enemy.draw(ctx));

    ctx.restore(); 

    requestAnimationFrame(gameLoop); 
}


gameLoop();