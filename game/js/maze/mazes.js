class Maze
{

    // выбор карты для уровня | wybór mapy dla poziomu
     constructor(map, tileSize)
    {
        this.grid = map;
        this.tileSize = tileSize;
        this.rows = map.length;
        this.cols = map[0].length;
    }

    // находит стартовую позицию | znajduje początkowy tile
    getStartPos() {
        const lastRowIndex = this.rows - 1;
        for (let x = 0; x < this.cols; x++) {
            if (this.grid[lastRowIndex][x] === 0) {
                return { x: x, y: lastRowIndex };
            }
        }
    }

    // находит выход | znajduje wyjście
    getExitPos() {
        for (let x = 0; x < this.cols; x++) {
            if (this.grid[0][x] === 0) {
                return { x: x, y: 0 };
            }
        }
    }   

    checkRoomEntry(targetX, targetY) {


        const cellValue = this.grid[targetY][targetX];
        
        if (cellValue >= 11) {
            const room = roomsData[cellValue];
            
            if (room && room.isLocked) {
                UI.showMessage(t.messages.room_locked);
                return false;
            }
        }
        return true;
    }

    checkExitEntry(targetX, targetY) {
    const exit = this.getExitPos();
    if (targetX === exit.x && targetY === exit.y) {
        const hasKey = Inventory.items.some(it => it.id === 'rusty_key');
        if (!hasKey) {
            UI.showMessage(t.messages.exit_locked);
            return false;
        }
    }
    return true;
}

    // отрисовка лабиринта | rysowanie labiryntu 
    draw(ctx) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x] === 1) {
                    ctx.fillStyle = "black"; 
                } else {
                    ctx.fillStyle = "white"; 
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
        const exit = this.getExitPos();
        ctx.fillStyle = "rgba(46, 204, 113, 0.5)";
        ctx.fillRect(exit.x * this.tileSize, exit.y * this.tileSize, this.tileSize, this.tileSize);
    }  

    // проверка стен | sprawdzanie ścian
    isWall(x, y) {
        if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) {
            return true; 
        }
        return this.grid[y][x] === 1;
    }

    isFreeCell(x, y) {
        if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) {
            return false;
        }
        return this.grid[y][x] === 0;
    }
}
