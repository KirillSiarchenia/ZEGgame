class Enemy {
    constructor(x, y, path = []) {
        this.gridX = x;
        this.gridY = y;
        this.dirX = 0;
        this.dirY = 1;
        
        this.x = x * tileSize;
        this.y = y * tileSize;
        
        this.state = 'patrol'; 
        this.patrolPath = path; 
        this.pathIndex = 0;
        this.spawnPoint = { x, y };
        
        this.lastPlayerPos = null; 
        this.playerLastDir = { dx: 0, dy: 0 };
        this.searchTimer = 0;
        this.lastAttack = 0;

        this.currentPath = [];
        this.finalTargetX = null;
        this.finalTargetY = null;
    }

    get isMoving() {
        return this.x !== this.gridX * tileSize || this.y !== this.gridY * tileSize;
    }
    
    update(player, maze) {
        const dist = this.getDistanceTo(player.gridX, player.gridY);
        const canSee = this.hasLineOfSight(player.gridX, player.gridY, maze);
        const canHear = (dist <= ENEMY_CONFIG.HEAR_RANGE) && player.isMoving;

        // выбор состояния | wybór stanu
        if (canSee || canHear) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.playerLastDir = { dx: player.lastMoveX, dy: player.lastMoveY };
            this.searchTimer = 0; 
        } 
        else if (this.state === 'chase' && !canSee) {
            this.state = 'searching';
            this.searchingPhase = 'reachLocation';
        }

        // логика состояний | logika stanów
        switch (this.state) {
            case 'chase':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze, player);
                if (Math.abs(this.gridX - player.gridX) + Math.abs(this.gridY - player.gridY) === 1 && !this.isMoving) {
                    this.checkAttack(player, maze);
                }
                break;
                
            case 'searching':
                if (this.searchingPhase === 'reachLocation') {
                    // Идем к последней точке, где видели игрока
                    this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze, player);
                    
                    if (this.gridX === this.lastPlayerPos.x && this.gridY === this.lastPlayerPos.y && !this.isMoving) {
                        // Когда дошли, переходим к фазе "заглянуть за угол"
                        this.searchingPhase = 'checkCorner';
                    }
                } 
                else if (this.searchingPhase === 'checkCorner') {
                    // Пытаемся сделать шаг в том направлении, куда шел игрок
                    const nextX = this.gridX + this.playerLastDir.dx;
                    const nextY = this.gridY + this.playerLastDir.dy;

                    if (!maze.isWall(nextX, nextY) && !this.isMoving) {
                        this.gridX = nextX;
                        this.gridY = nextY;
                        // После этого шага переходим к обычному осмотру сторон
                        this.searchingPhase = 'lookAround';
                    } else {
                        this.searchingPhase = 'lookAround';
                    }
                }
                else if (this.searchingPhase === 'lookAround') {
                    // Твоя работающая логика осмотра (без пути назад)
                    if (this.searchTimer === 0) {
                        const cameFromX = -this.dirX;
                        const cameFromY = -this.dirY;
                        this.searchDirs = this.getAvailableDirections(maze).filter(d => !(d.dx === cameFromX && d.dy === cameFromY));
                        if (this.searchDirs.length === 0) this.searchDirs = this.getAvailableDirections(maze);
                        this.maxSearchFrames = this.searchDirs.length * ENEMY_CONFIG.LOOK_TIME;
                    }

                    this.searchTimer++;
                    let dirIndex = Math.floor(this.searchTimer / ENEMY_CONFIG.LOOK_TIME);
                    if (dirIndex < this.searchDirs.length) {
                        this.dirX = this.searchDirs[dirIndex].dx;
                        this.dirY = this.searchDirs[dirIndex].dy;
                    }

                    if (this.searchTimer >= this.maxSearchFrames) {
                        this.state = 'patrol';
                        this.searchTimer = 0;
                    }
                }
                break;
                
                
            case 'patrol':
                if (this.patrolPath.length > 0) {
                    let target = this.patrolPath[this.pathIndex];
                    this.moveTowards(target.x, target.y, maze, player);
                    if (this.gridX === target.x && this.gridY === target.y) {
                        this.pathIndex = (this.pathIndex + 1) % this.patrolPath.length;
                    }
                }
                break;
        }

        this.smoothMove();
    }
    
    // легендарный а* вступает в игру
    moveTowards(targetX, targetY, maze, player) {
        if (this.lastAttack && Date.now() - this.lastAttack < ENEMY_CONFIG.KNOCKBACK_TIME) return; 

        const targetPxX = this.gridX * tileSize;
        const targetPxY = this.gridY * tileSize;

        if (this.x === targetPxX && this.y === targetPxY) {
            if (!this.currentPath || this.currentPath.length === 0 || 
                this.finalTargetX !== targetX || this.finalTargetY !== targetY) {
                
                this.finalTargetX = targetX;
                this.finalTargetY = targetY;
                this.currentPath = Pathfinding.findPath(this.gridX, this.gridY, targetX, targetY, maze);
            }

            if (this.currentPath && this.currentPath.length > 0) {
                let nextStep = this.currentPath[0];

                const isPlayerThere = (nextStep.x === player.gridX && nextStep.y === player.gridY);
                const isOtherEnemyThere = enemies.some(e => e !== this && e.gridX === nextStep.x && e.gridY === nextStep.y);

                if (!isPlayerThere && !isOtherEnemyThere) {
                    this.currentPath.shift();
                    
                    this.dirX = nextStep.x - this.gridX;
                    this.dirY = nextStep.y - this.gridY;

                    this.gridX = nextStep.x;
                    this.gridY = nextStep.y;
                } else {
                    this.dirX = nextStep.x - this.gridX;
                    this.dirY = nextStep.y - this.gridY;
                }
            }
        }
    }
        
    // функция для поиска(помогает выбрать в какие стороны смотреть) | metoda dla 'searching'(pomoga wybrać gdzie ma szukać)
    getAvailableDirections(maze) {
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        return directions.filter(d => !maze.isWall(this.gridX + d.dx, this.gridY + d.dy));
    }
        
        // видит ли | czy widzi 
    hasLineOfSight(tx, ty, maze) {
            
        if (this.gridX !== tx && this.gridY !== ty) return false;
            
        const diffX = tx - this.gridX;
        const diffY = ty - this.gridY;
            
        if (this.dirX !== 0 && Math.sign(diffX) !== Math.sign(this.dirX)) return false;
        if (this.dirY !== 0 && Math.sign(diffY) !== Math.sign(this.dirY)) return false;
            
        if (this.gridX === tx) {
            const start = Math.min(this.gridY, ty);
            const end = Math.max(this.gridY, ty);
            for (let y = start + 1; y < end; y++) {
                if (maze.isWall(tx, y)) return false;
            }
        } else {
            const start = Math.min(this.gridX, tx);
            const end = Math.max(this.gridX, tx);
            for (let x = start + 1; x < end; x++) {
                if (maze.isWall(x, ty)) return false;
            }
        }
            
        return true;
    }
    
    // плавное передвижение(опять) | płynny ruch 
    smoothMove() {
        let targetX = this.gridX * tileSize;
        let targetY = this.gridY * tileSize;

        if (this.x < targetX) this.x = Math.min(this.x + ENEMY_CONFIG.SPEED, targetX);
        else if (this.x > targetX) this.x = Math.max(this.x - ENEMY_CONFIG.SPEED, targetX);
        
        if (this.y < targetY) this.y = Math.min(this.y + ENEMY_CONFIG.SPEED, targetY);
        else if (this.y > targetY) this.y = Math.max(this.y - ENEMY_CONFIG.SPEED, targetY);
    }

    // атака | atak
    checkAttack(player, maze) {
        const now = Date.now();
        if (!this.lastAttack || now - this.lastAttack > ENEMY_CONFIG.ATTACK_COOLDOWN) {
            player.hp -= 1;
            this.lastAttack = now;
            player.applyKnockback(this.gridX, this.gridY, maze);
        }
    }

    // как далеко игрок | jak daleko gracz
    getDistanceTo(tx, ty) {
        return Math.sqrt(Math.pow(this.gridX - tx, 2) + Math.pow(this.gridY - ty, 2));
    }

    draw(ctx) {
        const stateColors = { 'chase': 'red', 'searching': 'yellow', 'patrol': 'orange' };
        ctx.fillStyle = stateColors[this.state];
        ctx.fillRect(this.x + 8, this.y + 8, tileSize - 16, tileSize - 16);

        ctx.fillStyle = "black";
        let eyeSize = 4;
        let offset = tileSize / 2 - eyeSize / 2;
        ctx.fillRect(
            this.x + offset + (this.dirX * ENEMY_CONFIG.EYE_OFFSET), 
            this.y + offset + (this.dirY * ENEMY_CONFIG.EYE_OFFSET), 
            eyeSize, eyeSize
        );
    }
}