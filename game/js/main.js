const allLanguages = {
    'ru': langRU, 
    'pl': langPL,
};

let currentLang = localStorage.getItem('game_lang') || 'ru';
let t = allLanguages[currentLang];

function setLanguage(langCode) {
    if (allLanguages[langCode]) {
        currentLang = langCode;
        t = allLanguages[langCode];
        localStorage.setItem('game_lang', langCode);
        UI.updateStaticTexts(); 
    }
}

function toggleNextLanguage() {
    const langKeys = Object.keys(allLanguages);
    let currentIndex = langKeys.indexOf(currentLang);
    let nextIndex = (currentIndex + 1) % langKeys.length;
    setLanguage(langKeys[nextIndex]);
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

const player = new Player(startPos.x, startPos.y);
const camera = new Camera(canvas.width, canvas.height, maze.cols * tileSize, maze.rows * tileSize);

window.onload = () => {
    UI.updateStaticTexts();
    UI.initMenuEvents();

    const invBtn = document.getElementById('inventory-btn');
    if (invBtn) {
        invBtn.addEventListener('click', () => UI.toggleInventory());
    }
    UI.setInventoryBtnVisibility(false);
};

window.addEventListener("keydown", (e) => {
    if (UI.isFullscreenPaused) return; // Защищаем от нажатий, если потерян полный экран

    const isEscape = e.key === "Escape";
    const isPauseKey = e.key.toLowerCase() === "p" || e.key.toLowerCase() === "з";

    if (isEscape || isPauseKey) {
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal && !confirmModal.classList.contains('hidden')) {
            if (isEscape) confirmModal.classList.add('hidden');
            return;
        }
        
        if (UI.isMessageActive) {
            if (isEscape) UI.closeMessage(false); 
            return;
        }

        const ctxMenu = document.getElementById('item-context-menu');
        if (ctxMenu) { 
            if (isEscape) ctxMenu.remove(); 
            return; 
        }

        if (UI.selectedItemForUse) { 
            if (isEscape) UI.resetCursor(); 
            return; 
        }

        const settingsMenu = document.getElementById('settings-menu');
        if (settingsMenu && !settingsMenu.classList.contains('hidden')) {
            if (isEscape) {
                settingsMenu.classList.add('hidden');
                document.getElementById(UI.settingsParent).classList.remove('hidden');
            }
            return;
        }

        const invModal = document.getElementById('inventory-modal');
        if (invModal && !invModal.classList.contains('hidden')) {
            if (isEscape) UI.toggleInventory();
            return;
        }

        if (currentState !== GameState.MENU) UI.togglePauseMenu();
    }

    if (e.key) keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mouseup", (e) => {
    if (UI.isMessageActive || UI.isPaused || UI.isFullscreenPaused) {
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

function loadEnemies(levelIndex) {
    const levelKey = "map" + (levelIndex + 1);
    enemies = []; 
    
    if (enemiesData[levelKey]) {
        enemiesData[levelKey].forEach(data => {
            enemies.push(new Enemy(data.x, data.y, data.path));
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

function drawFogOfWar(ctx, player, camera) {
    ctx.save();

    const lightRadius = 300; 
    
    const screenX = player.x + (tileSize / 2) - camera.x;
    const screenY = player.y + (tileSize / 2) - camera.y;

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

const keys = {};

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

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        if (currentState !== GameState.MENU) {
            UI.showFullscreenPause();
        }
    } else {
        if (UI.isFullscreenPaused) {
            UI.hideFullscreenPause();
        }
        resizeCanvas();
    }
});

resizeCanvas(); 

function setGameState(newState) {
    currentState = newState;
    const consPanel = document.getElementById('consumables-panel');
    const roomNavUi = document.getElementById('room-nav-ui'); 
    
    if (newState === GameState.MAZE) {
        UI.setInventoryBtnVisibility(false);
        if (consPanel) consPanel.classList.remove('hidden-ui'); 
        if (roomNavUi) roomNavUi.classList.add('hidden-ui'); 
         
        UI.updateConsumables(Inventory.items); 

    } else if (newState === GameState.ROOM) {
        UI.setInventoryBtnVisibility(true);
        if (consPanel) consPanel.classList.add('hidden-ui'); 
        if (roomNavUi) roomNavUi.classList.remove('hidden-ui'); 
        
        UI.renderInventory(Inventory.items);
        if (roomManager) roomManager.updateArrows(); 
    } else {
        UI.setInventoryBtnVisibility(false);
        if (consPanel) consPanel.classList.add('hidden-ui');
        if (roomNavUi) roomNavUi.classList.add('hidden-ui'); 
    }
}

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
            player.x = nx * tileSize;
            player.y = ny * tileSize;
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

function handleTransition(dt) {
    const fadeSpeed = 3.0; 

    if (currentState === GameState.TRANSITION) {
        transitionAlpha += fadeSpeed * dt;
        if (transitionAlpha >= 1) {
            transitionAlpha = 1;
            const roomID = maze.grid[player.gridY][player.gridX];
            setGameState(GameState.ROOM);
            roomManager.enter(roomID, player.gridX, player.gridY);
        }
    } else if (transitionAlpha > 0) {
        transitionAlpha -= fadeSpeed * dt;
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

function update(dt) {
    if (currentState !== GameState.MAZE || UI.isMessageActive || UI.isPaused) return;

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

    enemies.forEach(enemy => enemy.update(player, maze, dt));

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
    }
    
    if (currentState === GameState.ROOM) {
        roomManager.draw(ctx, canvas.width, canvas.height); 
    }

    if (transitionAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

let lastTime = performance.now();

function gameLoop(timestamp = performance.now()) {
    if (currentState === GameState.MENU) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt > 0.1) dt = 0.1;

    if (!UI.isMessageActive && !UI.isPaused) {
        if (currentState === GameState.MAZE || currentState === GameState.TRANSITION) {
            update(dt);             
            player.update(dt);     

            if (!player.isMoving) {
                checkMazeItemPickup(player.gridX, player.gridY); 
            }

            camera.update(player.x, player.y); 
        }
        
        handleTransition(dt); 
        drawAll();
    }

    requestAnimationFrame(gameLoop); 
}

requestAnimationFrame(gameLoop);