class Player {
    constructor(x, y, tileSize) {
        this.gridX = x; 
        this.gridY = y;
        this.tileSize = tileSize;

        this.x = x * tileSize;
        this.y = y * tileSize;

        this.speed = 5;
        this.hp = 3;
    }

    // проверка движения(для "слуха" врагов) | sprawdzanie ruchu(dla przeciwników)
    get isMoving() {
    return this.x !== this.gridX * this.tileSize || this.y !== this.gridY * this.tileSize;
}

    // отдача после удара врага | odrzut po ataku przeciwnika
    applyKnockback(enemyGridX, enemyGridY, maze) {
    this.knockbackTimer = Date.now() + 400;

    let dx = this.gridX - enemyGridX;
    let dy = this.gridY - enemyGridY;

    // Если стоят в одной клетке, откидываем в случайную сторону или вниз
    if (dx === 0 && dy === 0) dy = 1;

    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);

    const distance = 2; 
    for (let i = 0; i < distance; i++) {
        let nextX = this.gridX + stepX;
        let nextY = this.gridY + stepY;

        if (!maze.isWall(nextX, nextY)) {
            this.gridX = nextX;
            this.gridY = nextY;
        } else {
            break; 
        }
    }
}

    update(){
        let targetX = this.gridX * this.tileSize;
        let targetY = this.gridY * this.tileSize;
        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
    }
    // отрисовка персонажа | rysowanie postaci
    draw(ctx) {
        ctx.fillStyle = "blue";        
        ctx.fillRect(this.x + 5, this.y + 5, this.tileSize - 10, this.tileSize - 10);
    }

    // движение персонажа | ruch postaci
    move(dx, dy, maze, enemies) {        
        if (this.knockbackTimer > Date.now()) {
            return;
        }
        if (this.x === this.gridX * this.tileSize && this.y === this.gridY * this.tileSize) {
            const nextX = this.gridX + dx;
            const nextY = this.gridY + dy;

            const isWall = maze.isWall(nextX, nextY);            
            const isEnemyThere = enemies.some(enemy => enemy.gridX === nextX && enemy.gridY === nextY);

            if (!isWall && !isEnemyThere) {
                this.gridX = nextX;
                this.gridY = nextY;
            }
        }
    }
}