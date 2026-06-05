const allLanguages = {
    'ru': langRU, 
    'pl': langPL,
};

let currentLang = localStorage.getItem('game_lang') || 'pl';
let t = allLanguages[currentLang];

// управление локализацией | zarządzanie lokalizacją
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

const itemAssets = {
    sheet: new Image(),
    cache: {}
};
itemAssets.sheet.src = 'ui/assets/inventory-items.png';

function getCachedImage(path) {
    if (!itemAssets.cache[path]) {
        const img = new Image();
        img.src = path;
        itemAssets.cache[path] = img;
    }
    return itemAssets.cache[path];
}

const allLevels = [maps.map1, maps.map2, maps.map3, maps.map4];

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
    
    resetRoomsData();
    const invBtn = document.getElementById('inventory-btn');
    if (invBtn) {
        invBtn.addEventListener('click', () => UI.toggleInventory());
    }
    UI.setInventoryBtnVisibility(false);
};

// глобальные обработчики ввода клавиатуры | globalne procedury obsługi wprowadzania z klawiatury
window.addEventListener("keydown", (e) => {
    if (UI.isFullscreenPaused) return; 

    if (typeof CutsceneManager !== 'undefined' && CutsceneManager.active) {
        if (e.key === "Escape" || e.key === " ") {
            e.preventDefault();
        }
        return;
    }

    const isEscape = e.key === "Escape";
    const isPauseKey = e.key.toLowerCase() === "p" || e.key.toLowerCase() === "з";
    const isSpace = e.key === " ";

    if (UI.isMessageActive) {
        if (isEscape || isSpace) {
            e.preventDefault(); 
            UI.closeMessage(false); 
        }
        return;
    }

    if (isEscape || isPauseKey) {
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal && !confirmModal.classList.contains('hidden')) {
            if (isEscape) confirmModal.classList.add('hidden');
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
    if (typeof CutsceneManager !== 'undefined' && CutsceneManager.active) { return; }
    keys[e.key.toLowerCase()] = false;
});

// глобальный обработчик кликов мыши на холсте (для комнат) | globalna procedura obsługi kliknięć myszą na płótnie (dla pokoi)
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

function restartGame() {
    currentLevelIndex = 2;
    Inventory.items = [];
    
    maze = new Maze(allLevels[currentLevelIndex], tileSize);
    resetRoomsData();
    loadEnemies(currentLevelIndex);
    loadMazeItems(currentLevelIndex);

    player.hp = PLAYER_CONFIG.MAX_HP;
    player.hasReceivedFirstDamage = false; 
    player.waitingForSafeMoment = false;     
    player.safeTimeElapsed = 0;               
    player.firstDamageReactionDone = false;     
    const startPos = maze.getStartPos();
    player.gridX = startPos.x;
    player.gridY = startPos.y;
    player.x = startPos.x * tileSize;
    player.y = startPos.y * tileSize;
    player.facing = 'down';
    player.invulnTimer = 0;
    player.blinkTimer = 0;

    UI.updateHealth(player.hp);
    UI.updateConsumables([]);
    UI.lastHp = player.hp;
    
    setGameState(GameState.MAZE);
    camera.focusOn(player.x, player.y);

    if (typeof SoundManager !== 'undefined') {
        SoundManager.setPauseMuffle(false);
        SoundManager.playAmbient('main');
    }
}

function resetRoomsData() {
    roomsData = JSON.parse(JSON.stringify(INITIAL_ROOMS_DATA));
}

// загрузка сущностей уровня | ładowanie encji poziomu
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


// отрисовка эффекта тумана войны вокруг игрока | rysowanie efektu mgły wojny wokół gracza
function drawFogOfWar(ctx, player, camera) {
    ctx.save();

    const radius = player.visionRadius;
    
    const screenX = player.x + (tileSize / 2) - camera.x;
    const screenY = player.y + (tileSize / 2) - camera.y;

    const gradient = ctx.createRadialGradient(
        screenX, screenY, radius * 0.4, 
        screenX, screenY, radius
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

// изменение текущего состояния игры (меню/лабиринт/комната) | zmiana aktualnego stanu gry (menu/labirynt/pokój)
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

// переход на следующий уровень | przejście do następnego poziomu
function nextLevel() {
    currentLevelIndex++;
    
    if (!allLevels[currentLevelIndex]) return;
    
    maze = new Maze(allLevels[currentLevelIndex], tileSize);
    loadEnemies(currentLevelIndex);
    loadMazeItems(currentLevelIndex);
    
    if (currentLevelIndex === 3) {
        player.gridX = 3; 
        player.gridY = 1;
        player.sprite.src = ENEMY_CONFIG.SPRITE_PATH; 
        document.getElementById('ui-container').style.display = 'none';
        Epilogue.start(3, 12); 
    } else {
        UI.showMessage(t.interactions.key_broken);
        const startPos = maze.getStartPos();
        player.gridX = startPos.x;
        player.gridY = startPos.y;
        player.sprite.src = PLAYER_CONFIG.SPRITE_PATH; 
        player.isControlLocked = false; 
        Epilogue.active = false;
    }

    player.x = player.gridX * tileSize;
    player.y = player.gridY * tileSize;

    camera.mapWidth = maze.cols * tileSize;
    camera.mapHeight = maze.rows * tileSize;
    camera.focusOn(player.x, player.y);
}


// выход из комнаты в лабиринт | wyjście z pokoju do labiryntu
function exitRoom() {
    const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

    for (let d of directions) {
        let nx = player.gridX + d.x;
        let ny = player.gridY + d.y;
        
        if (maze.isFreeCell(nx, ny)) {
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

// эффекты затемнения при входе в комнату | efekty zaciemnienia przy wejściu do pokoju
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

// проверка подбора предметов | sprawdzanie podnoszenia przedmiotów
function checkMazeItemPickup(gridX, gridY) {
    for (let item of currentMazeItems) {
        if (!item.collected && gridX === item.x && gridY === item.y) {
            const libData = ObjectsLibrary[item.id]; 
            if (libData) {
                item.collected = true;
                Inventory.addItem({ ...libData });
                
                const pickUpMessage = t.itemPickUp?.[item.id] || `${item.id} подобран`; 
                UI.showMessage(pickUpMessage);
            }
        }
    }
}

// обновление состояния игры | aktualizacja stanu gry
function update(dt) {
    if (currentState !== GameState.MAZE || UI.isMessageActive || UI.isPaused) return;
    if (player.hp <= 0 && currentState !== GameState.DEAD) {
        setGameState(GameState.DEAD); 
                setTimeout(() => {
            UI.showDeathMenu(); 
        }); 
        return;
    }

    Epilogue.update(dt);

    let dx = 0;
    let dy = 0;

    // обработка ввода движения | obsługa wejścia ruchu\
    if (!player.isControlLocked) {
        if (keys["w"] || keys["arrowup"] || keys["ц"]) dy = -1;
        else if (keys["s"] || keys["arrowdown"] || keys["ы"]) dy = 1;
        else if (keys["a"] || keys["arrowleft"] || keys["ф"]) dx = -1;
        else if (keys["d"] || keys["arrowright"] || keys["в"]) dx = 1;
    }

    // попытка движения игрока | próba ruchu gracza
    if ((dx !== 0 || dy !== 0) && !player.isMoving) {
        const targetX = player.gridX + dx;
        const targetY = player.gridY + dy;
        
        if (maze.grid[targetY]?.[targetX] !== undefined) {
            if (maze.checkExitEntry(targetX, targetY) && maze.checkRoomEntry(targetX, targetY)) {
                player.move(dx, dy, maze, enemies);
            }
        }
    }

    // переход в комнату | przejście do pokoju
    const cellValue = maze.grid[player.gridY]?.[player.gridX];
    if (cellValue >= 11 && !player.isMoving) {
        startTransitionToRoom();
        SoundManager.play('doorOpen');
    }

    enemies.forEach(enemy => enemy.update(player, maze, dt));

    const exit = maze.getExitPos();
    if (exit && player.gridX === exit.x && player.gridY === exit.y && !player.isMoving) {
        const keyItem = Inventory.items.find(it => it.id === 'rusty_key');
        if (keyItem) Inventory.removeItem(keyItem.instanceId);
        SoundManager.play('doorOpen');
        
        if (currentLevelIndex === 2) { 
            CutsceneManager.play('outro', () => {
                setGameState(GameState.MAZE); 
                nextLevel(); 
            });
        } else {
            nextLevel();
        }
    }

    if (player.hp !== UI.lastHp) {
        UI.updateHealth(player.hp);
        UI.lastHp = player.hp;
    }
}

// главный метод отрисовки всей сцены | główna metoda rysowania całej sceny
function drawAll() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовка лабиринта
    if (currentState === GameState.MAZE || currentState === GameState.TRANSITION || currentState === GameState.DEAD) {
        ctx.save();
        camera.apply(ctx); 
        maze.draw(ctx); 

        // Предметы на полу
        currentMazeItems.forEach(item => {
            if (!item.collected) {
                const centerX = item.x * tileSize + tileSize / 2;
                const centerY = item.y * tileSize + tileSize / 2;
                
                const dw = item.w || tileSize * 0.7;
                const dh = item.h || tileSize * 0.7;
                const dx = centerX - dw / 2;
                const dy = centerY - dh / 2;

                if (item.imagePath) {
                    const img = getCachedImage(item.imagePath);
                    if (img.complete) ctx.drawImage(img, dx, dy, dw, dh);
                } 
                else if (item.spriteIndex !== undefined && itemAssets.sheet.complete) {
                    const sz = 100;
                    ctx.drawImage(itemAssets.sheet, item.spriteIndex * sz, 0, sz, sz, dx, dy, dw, dh);
                } 
                else {
                    ctx.fillStyle = item.color || "gold";
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        // Враги и игрок
        enemies.forEach(enemy => enemy.draw(ctx)); 
        Epilogue.draw(ctx);
        player.draw(ctx);                          

        ctx.restore();
        // drawFogOfWar(ctx, player, camera);
    }
    
    // Отрисовка внутренностей комнаты поверх | rysowanie wnętrza pokoju na wierzchu
    if (currentState === GameState.ROOM) {
        roomManager.draw(ctx, canvas.width, canvas.height); 
    }

    // Применение прозрачного слоя для эффекта перехода | nałożenie przezroczystej warstwy dla efektu przejścia
    if (transitionAlpha > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${transitionAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

let lastTime = performance.now();

// основной игровой цикл браузера | główna pętla gry przeglądarki
function gameLoop(timestamp = performance.now()) {
    if (currentState === GameState.MENU) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // расчет дельты времени между кадрами | obliczanie różnicy czasu między klatkami
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt > 0.1) dt = 0.1;

    if (slashAnim.active) {
        slashAnim.frameTimer += dt;
        
        if (slashAnim.frameTimer >= slashAnim.frameDuration) {
            slashAnim.frameTimer = 0;
            slashAnim.frame++;
            if (slashAnim.frame >= slashAnim.maxFrames) {
                slashAnim.active = false; 
            }
        }

        // Если анимация ВСЁ ЕЩЁ активна - рисуем её
        if (slashAnim.active) {
            // Заливаем экран чернотой
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (slashAnim.sprite.complete && slashAnim.sprite.naturalWidth > 0) {
                ctx.save();
                const screenX = slashAnim.x - camera.x;
                const screenY = slashAnim.y - camera.y;

                const fw = slashAnim.sprite.naturalWidth / slashAnim.maxFrames;
                const fh = slashAnim.sprite.naturalHeight;

                const drawW = tileSize * 2.5; 
                const drawH = tileSize * 2.5;
                const drawX = screenX - (drawW - tileSize) / 2;
                const drawY = screenY - (drawH - tileSize) / 2;

                ctx.drawImage(
                    slashAnim.sprite,
                    slashAnim.frame * fw, 0, fw, fh,
                    drawX, drawY, drawW, drawH     
                );
                ctx.restore();
            }

            requestAnimationFrame(gameLoop);
            return; // БЛОКИРУЕМ остальную игру!
        }
    }

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

const Epilogue = {
    active: false,
    phase: 0,
    brother: null,
    stepTimer: 0, 

    start(bx, by) {
        this.active = true;
        this.phase = 0;
        this.stepTimer = 0;
        this.brother = { x: bx * tileSize, y: by * tileSize, gridY: by };
        player.isControlLocked = false; 
        player.speed = PLAYER_CONFIG.SPEED; 

        SoundManager.playAmbient('end');
    },

    update(dt) {
        if (!this.active) return;
        
        const distY = Math.abs(player.gridY - this.brother.gridY);
        
        if (this.phase === 0 && distY <= 2) {
            this.phase = 1;
            player.isControlLocked = true; 
            player.isMoving = false;
            UI.showMessage(t.messages.epilogue_1, 'top');
        }
        else if (this.phase === 1 && !UI.isMessageActive) {
            this.phase = 2;
            setTimeout(() => UI.showMessage("..."), 200);
        }
        else if (this.phase === 2 && !UI.isMessageActive) {
            
            if (!player.isMoving) {
                
                this.stepTimer += dt;
                
                if (this.stepTimer >= 0.6) {
                    this.stepTimer = 0; 
                    
                    if (player.gridY < this.brother.gridY - 1) {
                        player.move(0, 1, maze, []); 
                    } else {
                        this.phase = 3;
                        
                        setGameState(GameState.END); 
                        
                        triggerSlashEffect(this.brother.x, this.brother.y);

                        SoundManager.play('attack');
                        
                        setTimeout(() => {
                            document.getElementById('end-screen').classList.remove('hidden');
                            
                            setTimeout(() => {
                                location.reload();
                            }, 4000);
                            
                        }, 1500);
                    }
                }
            }
        }
    },

    draw(ctx) {
        if (!this.active) return;
        const img = getCachedImage(PLAYER_CONFIG.SPRITE_PATH);
        if (img.complete) {
            const fw = PLAYER_CONFIG.FRAME_WIDTH;
            const fh = PLAYER_CONFIG.FRAME_HEIGHT;
            ctx.drawImage(img, 0, fh, fw, fh, this.brother.x, this.brother.y, tileSize, tileSize);
        }
    }
};
