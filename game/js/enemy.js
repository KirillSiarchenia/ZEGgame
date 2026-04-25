class Enemy {
    constructor(x, y, tileSize, path = []) {
        this.gridX = x;
        this.gridY = y;
        this.tileSize = tileSize;
        
        this.x = x * tileSize;
        this.y = y * tileSize;
        
        this.speed = 3; // musi być podzielna przez tileSize
        
        this.state = 'patrol'; 
        this.patrolPath = path; 
        this.pathIndex = 0;
        this.spawnPoint = { x, y };
        
        this.lastPlayerPos = null; 
        this.searchTimer = 0;
        this.lastAttack = 0;

        // Переменные для хранения рассчитанного пути (A*)
        this.currentPath = [];
        this.finalTargetX = null;
        this.finalTargetY = null;
    }

    get currentVisionRange() {
        // Радиус "слуха" работает только в патруле
        return this.state === 'patrol' ? 3 : 0;
    }

    update(player, maze) {
        const dist = this.getDistanceTo(player.gridX, player.gridY);
        const canSee = this.hasLineOfSight(player.gridX, player.gridY, maze);

        // 1. ОПРЕДЕЛЕНИЕ СОСТОЯНИЯ (МОЗГ)
        if (canSee || (dist <= this.currentVisionRange)) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.searchTimer = 0; 
        } 
        else if (this.state === 'chase' && !canSee) {
            this.state = 'searching';
        }

        // 2. ВЫПОЛНЕНИЕ ЛОГИКИ СОСТОЯНИЙ
        switch (this.state) {
            case 'chase':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);
                this.checkAttack(player);
                break;
                
            case 'searching':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);
                // Если дошли до последней точки, где видели игрока — ждем
                if (this.gridX === this.lastPlayerPos.x && this.gridY === this.lastPlayerPos.y) {
                    this.searchTimer++;
                    if (this.searchTimer > 120) {
                        this.state = 'returning';
                    }
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
    }

    // Использование глобального объекта Pathfinding из pathfinding.js
    moveTowards(targetX, targetY, maze) {
        const targetPxX = this.gridX * this.tileSize;
        const targetPxY = this.gridY * this.tileSize;

        // Принимаем решение только когда стоим ровно в клетке
        if (this.x === targetPxX && this.y === targetPxY) {
            
            // Если цель изменилась или пути нет — пересчитываем A*
            if (!this.currentPath || this.currentPath.length === 0 || 
                this.finalTargetX !== targetX || this.finalTargetY !== targetY) {
                
                this.finalTargetX = targetX;
                this.finalTargetY = targetY;
                // ВЫЗОВ ИЗ ВНЕШНЕГО ФАЙЛА pathfinding.js
                this.currentPath = Pathfinding.findPath(this.gridX, this.gridY, targetX, targetY, maze);
            }

            // Если путь найден, делаем следующий шаг
            if (this.currentPath && this.currentPath.length > 0) {
                let nextStep = this.currentPath.shift(); 
                this.gridX = nextStep.x;
                this.gridY = nextStep.y;
            }
        }
    }

    hasLineOfSight(tx, ty, maze) {
        if (this.gridX !== tx && this.gridY !== ty) return false;

        if (this.gridX === tx) { // Вертикаль
            const start = Math.min(this.gridY, ty);
            const end = Math.max(this.gridY, ty);
            for (let y = start + 1; y < end; y++) {
                if (maze.isWall(tx, y)) return false;
            }
        } else { // Горизонталь
            const start = Math.min(this.gridX, tx);
            const end = Math.max(this.gridX, tx);
            for (let x = start + 1; x < end; x++) {
                if (maze.isWall(x, ty)) return false;
            }
        }
        return true;
    }

    smoothMove() {
        let targetX = this.gridX * this.tileSize;
        let targetY = this.gridY * this.tileSize;

        // Используем Math.min/max, чтобы не проскочить цель при некратных скоростях
        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        else if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        else if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
    }

    checkAttack(player) {
        if (Math.abs(this.gridX - player.gridX) <= 1 && Math.abs(this.gridY - player.gridY) <= 1) {
            if (Date.now() - this.lastAttack > 1000) {
                player.hp -= 1;
                console.log("Player HP:", player.hp);
                this.lastAttack = Date.now();
            }
        }
    }

    getDistanceTo(tx, ty) {
        return Math.sqrt(Math.pow(this.gridX - tx, 2) + Math.pow(this.gridY - ty, 2));
    }

    draw(ctx) {
        // Цвет зависит от состояния: Погоня - красный, Поиск - желтый, Патруль/Возврат - оранжевый
        const stateColors = {
            'chase': 'red',
            'searching': 'yellow',
            'returning': 'orange',
            'patrol': 'orange'
        };
        
        ctx.fillStyle = stateColors[this.state];
        ctx.fillRect(this.x + 8, this.y + 8, this.tileSize - 16, this.tileSize - 16);
    }
}