class Enemy {
    constructor(x, y, path =[]) {
        this.gridX = x;
        this.gridY = y;
        this.dirX = 0;
        this.dirY = 1;
        
        this.x = x * tileSize;
        this.y = y * tileSize;
        
        this.state = 'patrol'; 
        this.patrolPath = path; 
        this.pathIndex = 0;
        
        this.lastPlayerPos = null; 
        this.playerLastDir = { dx: 0, dy: 0 };
        this.lastContactType = null; // 'sight' или 'sound'
        
        this.searchTimer = 0;
        this.lastAttack = 0;

        this.attackCooldown = 0;
        this.knockbackTimer = 0;

        this.currentPath =[];
        this.finalTargetX = null;
        this.finalTargetY = null;
    }

    get isMoving() {
        return this.x !== this.gridX * tileSize || this.y !== this.gridY * tileSize;
    }
    
    update(player, maze, dt) {
        if (this.attackCooldown > 0) this.attackCooldown -= dt * 1000;
        if (this.knockbackTimer > 0) this.knockbackTimer -= dt * 1000;

        const dist = this.getDistanceTo(player.gridX, player.gridY);
        let canSee = this.hasLineOfSight(player.gridX, player.gridY, maze);
        let canHear = (dist <= ENEMY_CONFIG.HEAR_RANGE) && player.isMoving;

        const distGrid = Math.abs(this.gridX - player.gridX) + Math.abs(this.gridY - player.gridY);
        if (distGrid <= 1) {
            canSee = true; 
        }

        if (this.lastContactType === 'sight' && this.state !== 'patrol' && !canSee) {
            canHear = false;
        }

        if (canSee) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.lastContactType = 'sight';
            this.searchTimer = 0; 
        } 
        else if (canHear) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.lastContactType = 'sound';
            this.searchTimer = 0;
        }
        else if (this.state === 'chase') {
            this.state = 'searching';
            this.searchingPhase = 'reachLocation';

            if (this.lastContactType === 'sight') {
                const dx = player.gridX - this.lastPlayerPos.x;
                const dy = player.gridY - this.lastPlayerPos.y;

                if (dx !== 0 || dy !== 0) {
                    this.playerLastDir = { dx: Math.sign(dx), dy: Math.sign(dy) };
                } else {
                    this.playerLastDir = { dx: player.lastMoveX, dy: player.lastMoveY };
                }
            } else {
                this.playerLastDir = { dx: 0, dy: 0 };
            }
        }

        switch (this.state) {
            case 'chase':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze, player);
                if (distGrid <= 1 && !this.isMoving) {
                    this.checkAttack(player, maze);
                }
                break;
                
            case 'searching':
                if (!this.isMoving) {
                    if (this.searchingPhase === 'reachLocation') {
                        if (this.gridX === this.lastPlayerPos.x && this.gridY === this.lastPlayerPos.y) {
                            
                            if ((this.playerLastDir.dx !== 0 || this.playerLastDir.dy !== 0) && this.tryInertiaStep(maze, player)) {
                                this.searchingPhase = 'inertia';
                            } else {
                                this.searchingPhase = 'lookAround';
                            }
                        } else {
                            this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze, player);
                        }
                    } 
                    else if (this.searchingPhase === 'inertia') {
                        if (this.isAtIntersection(maze)) {
                            this.searchingPhase = 'lookAround';
                        } else {
                            if (!this.tryInertiaStep(maze, player)) {
                                this.searchingPhase = 'lookAround';
                            }
                        }
                    }
                    else if (this.searchingPhase === 'lookAround') {
                        this.handleLookAround(maze, dt);
                    }
                }
                break;
                
            case 'patrol':
                if (this.patrolPath.length > 0) {
                    let target = this.patrolPath[this.pathIndex];
                    this.moveTowards(target.x, target.y, maze, player);
                    if (this.gridX === target.x && this.gridY === target.y && !this.isMoving) {
                        this.pathIndex = (this.pathIndex + 1) % this.patrolPath.length;
                    }
                }
                break;
        }

        this.smoothMove(dt);
    }

    tryInertiaStep(maze, player) {
        const nextX = this.gridX + this.playerLastDir.dx;
        const nextY = this.gridY + this.playerLastDir.dy;

        if (!maze.isWall(nextX, nextY)) {
            const pGridLeft = Math.floor(player.x / tileSize);
            const pGridRight = Math.floor((player.x + tileSize - 1) / tileSize);
            const pGridTop = Math.floor(player.y / tileSize);
            const pGridBottom = Math.floor((player.y + tileSize - 1) / tileSize);

            const isPlayerThere = (nextX === player.gridX && nextY === player.gridY) || 
                                  (nextX >= pGridLeft && nextX <= pGridRight && nextY >= pGridTop && nextY <= pGridBottom);

            const isOtherEnemyThere = enemies.some(e => e !== this && e.gridX === nextX && e.gridY === nextY);
            
            if (!isOtherEnemyThere && !isPlayerThere) {
                this.gridX = nextX;
                this.gridY = nextY;
                this.dirX = this.playerLastDir.dx;
                this.dirY = this.playerLastDir.dy;
                return true;
            }
        }
        return false;
    }

    handleLookAround(maze, dt) {
        if (this.searchTimer === 0) {
            const cameFromX = -this.dirX;
            const cameFromY = -this.dirY;
            this.searchDirs = this.getAvailableDirections(maze).filter(d => !(d.dx === cameFromX && d.dy === cameFromY));
            if (this.searchDirs.length === 0) this.searchDirs = this.getAvailableDirections(maze);
            this.maxSearchTime = this.searchDirs.length * ENEMY_CONFIG.LOOK_TIME;
        }

        this.searchTimer += dt;
        let dirIndex = Math.floor(this.searchTimer / ENEMY_CONFIG.LOOK_TIME);

        if (dirIndex < this.searchDirs.length) {
            this.dirX = this.searchDirs[dirIndex].dx;
            this.dirY = this.searchDirs[dirIndex].dy;
        }

        if (this.searchTimer >= this.maxSearchTime) {
            this.state = 'patrol';
            this.searchTimer = 0;
            this.searchingPhase = null;
            this.lastContactType = null; 
        }
    }

    isAtIntersection(maze) {
        if (this.playerLastDir.dx !== 0) {
            if (!maze.isWall(this.gridX, this.gridY + 1) || !maze.isWall(this.gridX, this.gridY - 1)) return true;
        } 
        else if (this.playerLastDir.dy !== 0) {
            if (!maze.isWall(this.gridX + 1, this.gridY) || !maze.isWall(this.gridX - 1, this.gridY)) return true;
        }
        return false;
    }
    
    moveTowards(targetX, targetY, maze, player) {
        if (this.knockbackTimer > 0) return; 

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

                const pGridLeft = Math.floor(player.x / tileSize);
                const pGridRight = Math.floor((player.x + tileSize - 1) / tileSize);
                const pGridTop = Math.floor(player.y / tileSize);
                const pGridBottom = Math.floor((player.y + tileSize - 1) / tileSize);

                const isPlayerThere = (nextStep.x === player.gridX && nextStep.y === player.gridY) || 
                                      (nextStep.x >= pGridLeft && nextStep.x <= pGridRight && nextStep.y >= pGridTop && nextStep.y <= pGridBottom);

                const isOtherEnemyThere = enemies.some(e => {
                    if (e === this) return false;
                    if (e.gridX === nextStep.x && e.gridY === nextStep.y) return true;
                    
                    const eGridLeft = Math.floor(e.x / tileSize);
                    const eGridRight = Math.floor((e.x + tileSize - 1) / tileSize);
                    const eGridTop = Math.floor(e.y / tileSize);
                    const eGridBottom = Math.floor((e.y + tileSize - 1) / tileSize);
                    return nextStep.x >= eGridLeft && nextStep.x <= eGridRight && nextStep.y >= eGridTop && nextStep.y <= eGridBottom;
                });

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
        
    getAvailableDirections(maze) {
        const directions =[
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        return directions.filter(d => !maze.isWall(this.gridX + d.dx, this.gridY + d.dy));
    }
        
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
    
    smoothMove(dt) {
        let targetX = this.gridX * tileSize;
        let targetY = this.gridY * tileSize;
        let step = ENEMY_CONFIG.SPEED * dt;

        if (this.x < targetX) this.x = Math.min(this.x + step, targetX);
        else if (this.x > targetX) this.x = Math.max(this.x - step, targetX);
        
        if (this.y < targetY) this.y = Math.min(this.y + step, targetY);
        else if (this.y > targetY) this.y = Math.max(this.y - step, targetY);
    }

    checkAttack(player, maze) {
        if (this.attackCooldown <= 0) {
            player.hp -= 1;
            
            this.attackCooldown = ENEMY_CONFIG.ATTACK_COOLDOWN;
            this.knockbackTimer = ENEMY_CONFIG.KNOCKBACK_TIME;

            player.applyKnockback(this.gridX, this.gridY, maze);

            if (!player.hasReceivedFirstDamage && !player.firstDamageReactionDone) {
                player.hasReceivedFirstDamage = true;
                player.waitingForSafeMoment = true;
            }
        }
    }

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