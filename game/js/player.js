class Player {
    constructor(x, y, tileSize) {
        this.gridX = x; 
        this.gridY = y;
        this.tileSize = tileSize;        
        this.hp = 3;
    }

    // отрисовка персонажа | rysowanie postaci
    draw(ctx) {
        ctx.fillStyle = "blue";
        
        const padding = 5;
        ctx.fillRect(
            this.gridX * this.tileSize + padding, 
            this.gridY * this.tileSize + padding, 
            this.tileSize - padding * 2, 
            this.tileSize - padding * 2
        );
    }

    // движение персонажа | ruch postaci
    move(dx, dy, maze) {
    const nextX = this.gridX + dx;
    const nextY = this.gridY + dy;

    if (!maze.isWall(nextX, nextY)) {
        this.gridX = nextX;
        this.gridY = nextY;
    }
}
}