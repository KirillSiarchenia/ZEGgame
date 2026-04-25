class Enemy {
    constructor(x, y, tileSize, path = []) {
        this.gridX = x;
        this.gridY = y;
        this.dirX = 0;
        this.dirY = 1;
        this.tileSize = tileSize;
        
        this.x = x * tileSize;
        this.y = y * tileSize;
        
        this.speed = 3; // должна делиться на tileSize | musi być podzielna przez tileSize
        
        this.state = 'patrol'; 
        this.patrolPath = path; 
        this.pathIndex = 0;
        this.spawnPoint = { x, y };
        
        this.lastPlayerPos = null; 
        this.searchTimer = 0;
        this.lastAttack = 0;

        this.currentPath = [];
        this.finalTargetX = null;
        this.finalTargetY = null;

        this.searchDirs = [];      
        this.framesPerLook = 40;   
        this.maxSearchFrames = 0;
    }

    get currentVisionRange() {
        // Слышит, только в 'patrol' | słyszy tylko w 'patrol'
        return this.state === 'patrol' ? 2 : 0;
    }

    update(player, maze) {
        const dist = this.getDistanceTo(player.gridX, player.gridY);
        const canSee = this.hasLineOfSight(player.gridX, player.gridY, maze);

        // выбор состояния | wybór stanu
        if (canSee || (dist <= this.currentVisionRange)) {
            this.state = 'chase';
            this.lastPlayerPos = { x: player.gridX, y: player.gridY };
            this.searchTimer = 0; 
        } 
        else if (this.state === 'chase' && !canSee) {
            this.state = 'searching';
        }

        // 2. логика состояний | logika stanów
        switch (this.state) {
            case 'chase':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);
                this.checkAttack(player);
                break;
                
            case 'searching':
                this.moveTowards(this.lastPlayerPos.x, this.lastPlayerPos.y, maze);

                if (this.gridX === this.lastPlayerPos.x && this.gridY === this.lastPlayerPos.y) {
                    
                    if (this.searchTimer === 0) {
                        this.searchDirs = this.getAvailableDirections(maze);
                        this.framesPerLook = 40; 
                        this.maxSearchFrames = this.searchDirs.length * this.framesPerLook;
                    }

                    this.searchTimer++;

                    let dirIndex = Math.floor(this.searchTimer / this.framesPerLook);

                    if (dirIndex < this.searchDirs.length) {
                        this.dirX = this.searchDirs[dirIndex].dx;
                        this.dirY = this.searchDirs[dirIndex].dy;
                    }

                    if (this.searchTimer >= this.maxSearchFrames) {
                        this.state = 'returning';
                        this.searchTimer = 0;
                        this.searchDirs = [];
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
    
    // легендарный а* вступает в игру
    moveTowards(targetX, targetY, maze) {
        const targetPxX = this.gridX * this.tileSize;
        const targetPxY = this.gridY * this.tileSize;
        
        if (this.x === targetPxX && this.y === targetPxY) {
            
            if (!this.currentPath || this.currentPath.length === 0 || 
                this.finalTargetX !== targetX || this.finalTargetY !== targetY) {
                    
                    this.finalTargetX = targetX;
                    this.finalTargetY = targetY;
                    this.currentPath = Pathfinding.findPath(this.gridX, this.gridY, targetX, targetY, maze);
                }
                
                if (this.currentPath && this.currentPath.length > 0) {
                    let nextStep = this.currentPath.shift(); 
                    
                    this.dirX = nextStep.x - this.gridX;
                    this.dirY = nextStep.y - this.gridY;
                    
                    this.gridX = nextStep.x;
                    this.gridY = nextStep.y;
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
        let targetX = this.gridX * this.tileSize;
        let targetY = this.gridY * this.tileSize;

        if (this.x < targetX) this.x = Math.min(this.x + this.speed, targetX);
        else if (this.x > targetX) this.x = Math.max(this.x - this.speed, targetX);
        
        if (this.y < targetY) this.y = Math.min(this.y + this.speed, targetY);
        else if (this.y > targetY) this.y = Math.max(this.y - this.speed, targetY);
    }

    // атака | atak
    checkAttack(player) {
        if (Math.abs(this.gridX - player.gridX) <= 1 && Math.abs(this.gridY - player.gridY) <= 1) {
            if (Date.now() - this.lastAttack > 1000) {
                player.hp -= 1;
                console.log("Player HP:", player.hp);
                this.lastAttack = Date.now();
            }
        }
    }

    // как далеко игрок | jak daleko gracz
    getDistanceTo(tx, ty) {
        return Math.sqrt(Math.pow(this.gridX - tx, 2) + Math.pow(this.gridY - ty, 2));
    }

    draw(ctx) {
        const stateColors = { 'chase': 'red', 'searching': 'yellow', 'returning': 'orange', 'patrol': 'orange' };
        ctx.fillStyle = stateColors[this.state];
        ctx.fillRect(this.x + 8, this.y + 8, this.tileSize - 16, this.tileSize - 16);

        ctx.fillStyle = "black";
        let eyeSize = 4;
        let offset = this.tileSize / 2 - eyeSize / 2;
        ctx.fillRect(
            this.x + offset + (this.dirX * 10), 
            this.y + offset + (this.dirY * 10), 
            eyeSize, eyeSize
        );
    }
}