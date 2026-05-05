const GameState = {
    MAZE: 'MAZE',
    ROOM: 'ROOM',
    TRANSITION: 'TRANSITION'
};
let currentState = GameState.MAZE;
let transitionAlpha = 0;
let roomManager = new RoomManager();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const allLevels = [maps.map1, maps.map2, maps.map3];
let currentLevelIndex = 0;
let enemies = [];
let currentMazeItems = [];
let maze = new Maze(allLevels[currentLevelIndex], tileSize);
loadEnemies(currentLevelIndex);
loadMazeItems(currentLevelIndex);
const startPos = maze.getStartPos();
const exitPos = maze.getExitPos();
window.onload = () => {
    const btn = document.getElementById('inventory-btn');
    if (btn) {
        btn.addEventListener('click', () => UI.toggleInventory());
    }
    UI.setInventoryBtnVisibility(false);
};

function loadEnemies(levelIndex) {
    const levelKey = "map" + (levelIndex + 1);
    enemies = []; 
    
    if (enemiesData[levelKey]) {
        enemiesData[levelKey].forEach(data => {
            enemies.push(new Enemy(data.x, data.y, data.tileSize, data.path));
        });
    }
}

function loadMazeItems(levelIndex) {
    const levelKey = "map" + (levelIndex + 1);
    currentMazeItems = [];
    
    if (mazeItemsData[levelKey]) {
        mazeItemsData[levelKey].forEach(data => {
            const libData = ObjectsLibrary[data.libId];
            currentMazeItems.push({ ...libData, ...data, collected: false });
        });
    }
}

// туман войны | mgła
function drawFogOfWar(ctx, player, camera) {
    ctx.save();

    const lightRadius = 300; 
    
    const screenX = player.x + (player.tileSize / 2) - camera.x;
    const screenY = player.y + (player.tileSize / 2) - camera.y;

    const gradient = ctx.createRadialGradient(
        screenX, screenY, lightRadius * 0.4, 
        screenX, screenY, lightRadius
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); 
    gradient.addColorStop(1, "rgba(0, 0, 0, 1)"); 

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
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

// отвечает за интерфейс в разных состояниях игры | odpowiada za ui w różnych stanach gry
function setGameState(newState) {
    currentState = newState;
    const consPanel = document.getElementById('consumables-panel');
    
    if (newState === GameState.MAZE) {
        UI.setInventoryBtnVisibility(false);
        if (consPanel) consPanel.classList.remove('hidden-ui'); 
         
        UI.updateConsumables(Inventory.items); 

    } else if (newState === GameState.ROOM) {
        UI.setInventoryBtnVisibility(true);
        if (consPanel) consPanel.classList.add('hidden-ui'); 
        UI.renderInventory(Inventory.items);
    } else {
        UI.setInventoryBtnVisibility(false);
        if (consPanel) consPanel.classList.add('hidden-ui');
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Мы уже приехали? | aktualizacja poziomów
function nextLevel() {
    currentLevelIndex++;
    
    if (currentLevelIndex < allLevels.length) {
        maze = new Maze(allLevels[currentLevelIndex], tileSize);
        loadEnemies(currentLevelIndex);
        loadMazeItems(currentLevelIndex);
        
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

// находит где встать игроку при выходу из комнаты | znajduje miejsce dla gracza po wyjściu z pokoju
function exitRoom() {
    const directions = [
        { x: 0, y: 1 }, { x: 0, y: -1 }, 
        { x: 1, y: 0 }, { x: -1, y: 0 }
    ];

    for (let d of directions) {
        let nx = player.gridX + d.x;
        let ny = player.gridY + d.y;
        
        if (maze.grid[ny] && maze.grid[ny][nx] === 0) {
            player.gridX = nx;
            player.gridY = ny;
            player.x = nx * player.tileSize;
            player.y = ny * player.tileSize;
            break; 
        }
    }

    setGameState(GameState.MAZE);
    transitionAlpha = 1; 
}

function startTransitionToRoom() {
    currentState = GameState.TRANSITION;
    transitionAlpha = 0;
}

function handleTransition() {
    if (currentState === GameState.TRANSITION) {
        transitionAlpha += 0.05;
        if (transitionAlpha >= 1) {
            transitionAlpha = 1;
            const roomID = maze.grid[player.gridY][player.gridX];
            setGameState(GameState.ROOM);
            roomManager.enter(roomID, player.gridX, player.gridY);
        }
    }else if (transitionAlpha > 0) {
        transitionAlpha -= 0.05; // Проявление (Fade in)
        if (transitionAlpha < 0) transitionAlpha = 0;
    }
}

function checkMazeItemPickup() {
    currentMazeItems.forEach(item => {
        if (!item.collected && player.gridX === item.x && player.gridY === item.y) {
            item.collected = true;
            
            const libData = ObjectsLibrary[item.libId]; 
            
            if (libData) {
                Inventory.addItem({ ...libData });
                console.log(`Подобрано: ${libData.name}`);
            }
        }
    });
}

function update() {
    if (currentState !== GameState.MAZE || UI.isMessageActive) return;
    // управление | kierowanie
    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"] || keys["ц"]) dy = -1;
    else if (keys["s"] || keys["arrowdown"] || keys["ы"]) dy = 1;
    else if (keys["a"] || keys["arrowleft"] || keys["ф"]) dx = -1;
    else if (keys["d"] || keys["arrowright"] || keys["в"]) dx = 1;


    if ((dx !== 0 || dy !== 0) && !player.isMoving) {
        const targetX = player.gridX + dx;
        const targetY = player.gridY + dy;
        
        if (maze.grid[targetY] !== undefined && maze.grid[targetY][targetX] !== undefined) {
            const targetCell = maze.grid[targetY][targetX];

            if (targetCell >= 11) {
                if (maze.checkRoomEntry(targetX, targetY)) {
                    player.move(dx, dy, maze, enemies);
                } 
            } else {
                player.move(dx, dy, maze, enemies);
            }
        }
    }

    const cellValue = maze.grid[player.gridY][player.gridX];
    if (cellValue >= 11 && !player.isMoving) {
        startTransitionToRoom();
    }

    // Появление противников | pojawienie przeciwników
    enemies.forEach(enemy => enemy.update(player, maze));

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

canvas.addEventListener("mousedown", (e) => {
    if (currentState !== GameState.ROOM || UI.isMessageActive) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const result = roomManager.handleMouseClick(mx, my, canvas.width, canvas.height);
    
    if (result === "EXIT") {
        exitRoom();
    }
});

function drawAll() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentState === GameState.MAZE || currentState === GameState.TRANSITION) {
        ctx.save();
        camera.apply(ctx); 

        maze.draw(ctx);   

        currentMazeItems.forEach(item => {
            if (!item.collected) {
                ctx.fillStyle = item.color || "gold";
                ctx.beginPath();
                ctx.arc(
                    item.x * tileSize + tileSize / 2, 
                    item.y * tileSize + tileSize / 2, 
                    10, 0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        enemies.forEach(enemy => enemy.draw(ctx)); 
        player.draw(ctx);                          

        ctx.restore();

        drawFogOfWar(ctx, player, camera)
    }
    
    if (currentState === GameState.ROOM) {
        roomManager.draw(ctx, canvas.width, canvas.height); 
    }

    if (transitionAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function gameLoop() {
    if(!UI.isMessageActive){
        if (currentState === GameState.MAZE || currentState === GameState.TRANSITION) {
            update();             
            player.update();     
            checkMazeItemPickup();
            camera.update(player.x, player.y);
        }
        
        handleTransition();
    }

    drawAll();

    requestAnimationFrame(gameLoop); 
}


gameLoop();