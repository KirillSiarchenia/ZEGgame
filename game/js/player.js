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

    // отрисовка персонажа | rysowanie postaci
    draw(ctx) {

        // плавное передвижение | płynny ruch
        let targetX = this.gridX * this.tileSize;
        let targetY = this.gridY * this.tileSize;
        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
        
        ctx.fillStyle = "blue";        
        ctx.fillRect(this.x + 5, this.y + 5, this.tileSize - 10, this.tileSize - 10);
    }

    // движение персонажа | ruch postaci
    move(dx, dy, maze) {
        // проверка на законченное движение | sprawdzanie czy ruch został skończony
        if (this.x === this.gridX * this.tileSize && this.y === this.gridY * this.tileSize) {
            if (!maze.isWall(this.gridX + dx, this.gridY + dy)) {
                this.gridX += dx;
                this.gridY += dy;
            }
        }
    }
}