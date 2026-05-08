class Player {
    constructor(x, y) {
        this.gridX = x; 
        this.gridY = y;

        this.x = x * tileSize;
        this.y = y * tileSize;

        this.lastMoveX = 0; 
        this.lastMoveY = 0;

        this.speed = tileSize * 0.15;
        this.hp = 3;
    }

    // проверка движения(для "слуха" врагов) | sprawdzanie ruchu(dla przeciwników)
    get isMoving() {
        return this.x !== this.gridX * tileSize || this.y !== this.gridY * tileSize;
    }

    // отдача после удара врага | odrzut po ataku przeciwnika
    applyKnockback(enemyGridX, enemyGridY, maze) {
        this.knockbackTimer = Date.now() + 400;

        let dx = this.gridX - enemyGridX;
        let dy = this.gridY - enemyGridY;

        // Если стоят в одной клетке
        if (dx === 0 && dy === 0) {
            dy = 1;
        }

        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);

        const distance = 2;

        for (let i = 0; i < distance; i++) {
            const nextX = this.gridX + stepX;
            const nextY = this.gridY + stepY;

            // Теперь проверяем именно свободный проход
            if (maze.isFreeCell(nextX, nextY)) {
                this.gridX = nextX;
                this.gridY = nextY;
            } else {
                break;
            }
        }
    }

    update(){
        let targetX = this.gridX * tileSize;
        let targetY = this.gridY * tileSize;
        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
    }
    draw(ctx) {
        ctx.fillStyle = "blue";        
        ctx.fillRect(this.x + 5, this.y + 5, tileSize - 10, tileSize - 10);
    }

    move(dx, dy, maze, enemies) {
        if (this.knockbackTimer > Date.now()) return;

        if (this.x === this.gridX * tileSize && this.y === this.gridY * tileSize) {
            const nextX = this.gridX + dx;
            const nextY = this.gridY + dy;

            const isWall = maze.isWall(nextX, nextY);
            const isEnemyThere = enemies.some(e => e.gridX === nextX && e.gridY === nextY);

            if (!isWall && !isEnemyThere) {
                this.gridX = nextX;
                this.gridY = nextY;
                this.lastMoveX = dx;
                this.lastMoveY = dy;
            }
        }
    }
}