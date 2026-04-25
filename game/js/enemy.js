class Enemy {
    constructor(x, y, tileSize, path = []) {
        this.gridX = x;
        this.gridY = y;
        this.tileSize = tileSize;
        this.lastPlayerPos = null; // Память о игроке
        this.searchTimer = 0;      // Таймер стояния на месте
        
        // Пиксельные координаты для плавной отрисовки (как у игрока)
        this.x = x * tileSize;
        this.y = y * tileSize;
        
        this.speed = 3; // Враги обычно чуть медленнее игрока
        
        // Патрулирование
        this.patrolPath = path; // Массив точек типа [{x: 1, y: 1}, {x: 5, y: 1}]
        this.pathIndex = 0;
        this.spawnPoint = { x, y };

        // Состояния: 'patrol', 'chase', 'returning'
        this.state = 'patrol'; 
    }

    get currentVisionRange() {
        // Если мы уже гонимся или ищем, "слух" нам не нужен, мы работаем по памяти/зрению
        return this.state === 'patrol' ? 3 : 0;
    }

    update(player, maze) {
        const dist = this.getDistanceTo(player.gridX, player.gridY);
        const canSee = this.hasLineOfSight(player.gridX, player.gridY, maze);

        if (canSee || (dist <= this.currentVisionRange)) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.searchTimer = 0; 
        }
        else if (this.state === 'chase' && !canSee) {
            this.state = 'searching';
        }

        switch (this.state) {
            case 'chase':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);
                this.checkAttack(player);
                break;

            case 'searching':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);
                if (this.gridX === this.lastPlayerPos.x && this.gridY === this.lastPlayerPos.y) {
                    this.searchTimer++;
                    if (this.searchTimer > 120) this.state = 'returning';
                }
                break;

            case 'returning':
                this.moveTowards(this.spawnPoint.x, this.spawnPoint.y, maze);
                if (this.gridX === this.spawnPoint.x && this.gridY === this.spawnPoint.y) {
                    this.state = 'patrol';
                }
                break;

            case 'patrol':
                if (this.patrolPath.length > 0) {
                    let target = this.patrolPath[this.pathIndex];
                    this.moveTowards(target.x, target.y, maze);
                    if (this.gridX === target.x && this.gridY === target.y) {
                        this.pathIndex = (this.pathIndex + 1) % this.patrolPath.length;
                    }
                }
                break;
        }
        
        this.smoothMove();
        // Сверху прочеканныый код       
    }

    hasLineOfSight(tx, ty, maze) {
        // Для простоты проверим только прямые линии (горизонталь/вертикаль)
        if (this.gridX !== tx && this.gridY !== ty) return false;

        // Проверяем, нет ли стен на пути луча
        if (this.gridX === tx) { // Вертикальный луч
            const start = Math.min(this.gridY, ty);
            const end = Math.max(this.gridY, ty);
            for (let y = start + 1; y < end; y++) {
                if (maze.isWall(tx, y)) return false;
            }
        } else { // Горизонтальный луч
            const start = Math.min(this.gridX, tx);
            const end = Math.max(this.gridX, tx);
            for (let x = start + 1; x < end; x++) {
                if (maze.isWall(x, ty)) return false;
            }
        }
        return true;
    }

    // Вспомогательный метод для плавного движения пиксельных координат
    smoothMove() {
        let targetX = this.gridX * this.tileSize;
        let targetY = this.gridY * this.tileSize;

        if (this.x < targetX) this.x += this.speed;
        if (this.x > targetX) this.x -= this.speed;
        if (this.y < targetY) this.y += this.speed;
        if (this.y > targetY) this.y -= this.speed;
    }

    moveTowards(targetX, targetY, maze) {
        // Простая логика: если мы не в целевой клетке, делаем шаг
        if (this.x === this.gridX * this.tileSize && this.y === this.gridY * this.tileSize) {
            let dx = 0, dy = 0;
            if (this.gridX < targetX) dx = 1;
            else if (this.gridX > targetX) dx = -1;
            else if (this.gridY < targetY) dy = 1;
            else if (this.gridY > targetY) dy = -1;

            if (!maze.isWall(this.gridX + dx, this.gridY + dy)) {
                this.gridX += dx;
                this.gridY += dy;
            }
        }
    }

    checkAttack(player) {
        // Если враг находится в той же или соседней клетке
        if (Math.abs(this.gridX - player.gridX) <= 1 && Math.abs(this.gridY - player.gridY) <= 1) {
            if (!this.lastAttack || Date.now() - this.lastAttack > 1000) {
                player.hp -= 1;
                console.log(player.hp);
                this.lastAttack = Date.now();
            }
        }
    }

    getDistanceTo(tx, ty) {
        return Math.sqrt(Math.pow(this.gridX - tx, 2) + Math.pow(this.gridY - ty, 2));
    }

    draw(ctx) {
        ctx.fillStyle = this.state === 'chase' ? "red" : "orange";
        ctx.fillRect(this.x + 8, this.y + 8, this.tileSize - 16, this.tileSize - 16);
    }
}