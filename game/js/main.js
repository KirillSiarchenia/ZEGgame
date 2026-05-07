const GameState = {
    MENU: 'MENU',
    MAZE: 'MAZE',
    ROOM: 'ROOM',
    TRANSITION: 'TRANSITION'
};

const allLanguages = {
    'ru': langRU, 
    'pl': langPL
};

let currentLang = localStorage.getItem('game_lang') || 'ru';
let t = allLanguages[currentLang];

function updateStaticUI() {
    const playBtn = document.getElementById('btn-play');
    const langBtn = document.getElementById('btn-lang');
    const invBtn = document.getElementById('inventory-btn');
    const invHeader = document.querySelector('.inventory-header h2');
    
    if (playBtn) playBtn.innerText = t.menu.play;
    if (langBtn) langBtn.innerText = t.menu.language;
    if (invBtn) invBtn.innerText = t.ui.inventory; 
    if (invHeader) invHeader.innerText = t.ui.inventory;
}

function setLanguage(langCode) {
    if (allLanguages[langCode]) {
        currentLang = langCode;
        t = allLanguages[langCode];
        localStorage.setItem('game_lang', langCode);
        updateStaticUI();
    }
}

let currentState = GameState.MENU;
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

const player = new Player(startPos.x, startPos.y, tileSize);
const camera = new Camera(canvas.width, canvas.height, maze.cols * tileSize, maze.rows * tileSize);
window.onload = () => {
    updateStaticUI();

    const playBtn = document.getElementById('btn-play');
    const langBtn = document.getElementById('btn-lang');
    const mainMenu = document.getElementById('main-menu');

    playBtn.addEventListener('click', () => {
        mainMenu.classList.add('hidden-ui'); 
        setGameState(GameState.MAZE);        
    });

    langBtn.addEventListener('click', () => {
        const nextLang = (currentLang === 'ru') ? 'pl' : 'ru';
        setLanguage(nextLang);
    });

    const invBtn = document.getElementById('inventory-btn');
    if (invBtn) {
        invBtn.addEventListener('click', () => UI.toggleInventory());
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
            const libData = ObjectsLibrary[data.id];
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

let hasTriedRunning = false;

function checkRunningHint(e) {
    if ((e.key === "Shift") && !hasTriedRunning && player.isMoving) {
        
        UI.showMessage(t.messages.running_hint);        
        hasTriedRunning = true;        
        window.removeEventListener("keydown", checkRunningHint);
    }
}

window.addEventListener("keydown", checkRunningHint);

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
        transitionAlpha -= 0.05;
        if (transitionAlpha < 0) transitionAlpha = 0;
    }
}

function checkMazeItemPickup(gridX, gridY) {
    currentMazeItems.forEach(item => {
        if (!item.collected && gridX === item.x && gridY === item.y) {
            
            const libData = ObjectsLibrary[item.id]; 
            
            if (libData) {
                item.collected = true;
                Inventory.addItem({ ...libData });
                
                const pickUpMessage = (t.itemPickUp && t.itemPickUp[item.id]) 
                    ? t.itemPickUp[item.id] 
                    : item.id + " подобран"; 

                UI.showMessage(pickUpMessage);
            }
        }
    });
}

function update() {
    if (currentState !== GameState.MAZE || UI.isMessageActive || UI.isPaused) return;
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
            const canExit = maze.checkExitEntry(targetX, targetY);
            const canEnterRoom = maze.checkRoomEntry(targetX, targetY);

            if (canExit && canEnterRoom) {
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
            const keyItem = Inventory.items.find(it => it.id === 'rusty_key');
            Inventory.removeItem(keyItem.instanceId);
            nextLevel();
        }
    }

    if (player.hp !== UI.lastHp) {
        UI.updateHealth(player.hp);
        UI.lastHp = player.hp;
    }
}

canvas.addEventListener("mouseup", (e) => {
    if (UI.isMessageActive|| UI.isPaused) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    if (UI.isMenuOpen) return;
    if (currentState !== GameState.ROOM) return;

    if (e.button !== 0) return;

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const result = roomManager.handleMouseClick(mx, my, canvas.width, canvas.height);

    if (UI.selectedItemForUse) {
        if (result !== "ITEM_USED") {
            UI.showMessage(t.messages.not_applicable);
            UI.selectedItemForUse = null;
            UI.resetCursor();
        }
    } else if (result === "EXIT") {
        exitRoom();
    }
}, true);

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
    if (currentState === GameState.MENU) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if(!UI.isMessageActive && !UI.isPaused){
        if (currentState === GameState.MAZE || currentState === GameState.TRANSITION) {
            update();             
            player.update();     

            if (!player.isMoving) {
                checkMazeItemPickup(player.gridX, player.gridY); 
            }

            camera.update(player.x, player.y);
        }
        
        handleTransition();
        drawAll();
    }


    requestAnimationFrame(gameLoop); 
}


gameLoop();