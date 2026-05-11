class Player {
    constructor(x, y) {
        this.gridX = x; 
        this.gridY = y;

        this.x = x * tileSize;
        this.y = y * tileSize;

        this.lastMoveX = 0; 
        this.lastMoveY = 0;

        this.hp = 3;
        this.maxHp = 3;

        this.hasReceivedFirstDamage = false; 
        this.waitingForSafeMoment = false;   
        this.safeTimeElapsed = 0;            
        this.firstDamageReactionDone = false; 
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

        if (dx === 0 && dy === 0) {
            dy = 1;
        }

        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);

        const distance = 2;

        for (let i = 0; i < distance; i++) {
            const nextX = this.gridX + stepX;
            const nextY = this.gridY + stepY;

            if (maze.isFreeCell(nextX, nextY)) {
                this.gridX = nextX;
                this.gridY = nextY;
            } else {
                break;
            }
        }
    }

    update(dt){
        let targetX = this.gridX * tileSize;
        let targetY = this.gridY * tileSize;
        let step = PLAYER_CONFIG.SPEED * dt;

        if (this.x < targetX) this.x = Math.min(this.x + step, targetX);
        if (this.x > targetX) this.x = Math.max(this.x - step, targetX);
        if (this.y < targetY) this.y = Math.min(this.y + step, targetY);
        if (this.y > targetY) this.y = Math.max(this.y - step, targetY);

        this.checkFirstDamageReaction(dt, enemies);
    }

    // Он умный, он знает команды, несмотря на небольшой череп, у него в мозгу помещается много информации
    checkFirstDamageReaction(dt, enemies) {
        if (this.firstDamageReactionDone || !enemies) return;

        if (this.hp < this.maxHp && !this.hasReceivedFirstDamage) {
            this.hasReceivedFirstDamage = true;
            this.waitingForSafeMoment = true;
        }

        if (this.waitingForSafeMoment) {
            const isSafe = enemies.every(e => e.state === 'patrol');

            if (isSafe) {
                this.safeTimeElapsed += dt;
                
                if (this.safeTimeElapsed >= 2.5) { 
                    UI.showMessage(t.messages.first_damage_reaction);
                    
                    this.firstDamageReactionDone = true;
                    this.waitingForSafeMoment = false; 
                }
            } else {
                this.safeTimeElapsed = 0;
            }
        }
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
            
            const isEnemyThere = enemies.some(e => {
                if (e.gridX === nextX && e.gridY === nextY) return true;
                
                const eGridLeft = Math.floor(e.x / tileSize);
                const eGridRight = Math.floor((e.x + tileSize - 1) / tileSize);
                const eGridTop = Math.floor(e.y / tileSize);
                const eGridBottom = Math.floor((e.y + tileSize - 1) / tileSize);

                return nextX >= eGridLeft && nextX <= eGridRight && nextY >= eGridTop && nextY <= eGridBottom;
            });

            if (!isWall && !isEnemyThere) {
                this.gridX = nextX;
                this.gridY = nextY;
                this.lastMoveX = dx;
                this.lastMoveY = dy;
            }
        }
    }
}