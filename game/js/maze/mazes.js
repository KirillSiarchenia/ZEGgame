class Maze {
    constructor(map, tileSize) {
        this.grid = map;
        this.rows = map.length;
        this.cols = map[0].length;
        
        this.wallImg = new Image();
        this.wallImg.src = 'ui/assets/wall.png';

        this.exitDoorImg = new Image();
        this.exitDoorImg.src = 'ui/assets/exit-door.png';
        
        this.floorColor = "#675147";
    }

    // находит стартовую позицию | znajduje początkowy tile
    getStartPos() {
        const lastRow = this.grid[this.rows - 1];
        const x = lastRow.indexOf(0);
        return x !== -1 ? { x, y: this.rows - 1 } : null;
    }

    // находит выход | znajduje wyjście
    getExitPos() {
        const x = this.grid[0].indexOf(0);
        return x !== -1 ? { x, y: 0 } : null;
    }   

    // проверка возможности войти в комнату | sprawdzenie możliwości wejścia do pokoju
    checkRoomEntry(targetX, targetY) {
        const cellValue = this.grid[targetY]?.[targetX];
        if (cellValue >= 11 && roomsData[cellValue]?.isLocked) {
            UI.showMessage(t.messages.room_locked);
            SoundManager.play('doorLocked');
            return false;
        }
        SoundManager.play('doorOpened');
        return true;
    }

    // проверка возможности выйти | sprawdzenie możliwości wyjścia
    checkExitEntry(targetX, targetY) {
        const exit = this.getExitPos();
        if (exit && targetX === exit.x && targetY === exit.y) {
            const hasKey = Inventory.items.some(it => it.id === 'rusty_key');
            if (!hasKey) {
                UI.showMessage(t.messages.exit_locked);
                SoundManager.play('doorLocked');
                return false;
            }
        }
        SoundManager.play('doorOpened');
        return true;
    }
    
    // отрисовка лабиринта | rysowanie labiryntu 
    draw(ctx) {
        const exitPos = this.getExitPos(); // Получаем координаты выхода

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.grid[y][x];
                const posX = x * tileSize;
                const posY = y * tileSize;

                if (cell === 1) {
                    if (this.wallImg.complete) {
                        ctx.drawImage(this.wallImg, posX, posY, tileSize, tileSize);
                    } else {
                        ctx.fillStyle = "black";
                        ctx.fillRect(posX, posY, tileSize, tileSize);
                    }
                } else {
                    // Рисуем пол для пустых клеток и комнат
                    ctx.fillStyle = this.floorColor;
                    ctx.fillRect(posX, posY, tileSize, tileSize);

                    // Отрисовываем дверь, если это клетка выхода
                    if (exitPos && x === exitPos.x && y === exitPos.y) {
                        if (this.exitDoorImg.complete) {
                            const doorW = 90;
                            const doorH = 90;
                            
                            // Центрируем дверь по клетке (если tileSize больше 90)
                            const doorX = posX + (tileSize - doorW) / 2;
                            const doorY = posY + (tileSize - doorH) / 2;
                            
                            ctx.drawImage(this.exitDoorImg, doorX, doorY, doorW, doorH);
                        }
                    }
                }
            }
        }
    }

    // проверка стен | sprawdzanie ścian
    isWall(x, y) {
        return this.grid[y]?.[x] === 1 || this.grid[y]?.[x] === undefined;
    }

    // проверяет свободна ли клетка | sprawdza czy komórka jest wolna
    isFreeCell(x, y) {
        return this.grid[y]?.[x] === 0;
    }
}