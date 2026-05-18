class Maze {
    constructor(map, tileSize) {
        this.grid = map;
        this.tileSize = tileSize;
        this.rows = map.length;
        this.cols = map[0].length;
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
            return false;
        }
        return true;
    }

    // проверка возможности выйти | sprawdzenie możliwości wyjścia
    checkExitEntry(targetX, targetY) {
        const exit = this.getExitPos();
        if (exit && targetX === exit.x && targetY === exit.y) {
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
                ctx.fillStyle = this.grid[y][x] === 1 ? "black" : "white";
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
        const exit = this.getExitPos();
        if (exit) {
            ctx.fillStyle = "rgba(46, 204, 113, 0.5)";
            ctx.fillRect(exit.x * this.tileSize, exit.y * this.tileSize, this.tileSize, this.tileSize);
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