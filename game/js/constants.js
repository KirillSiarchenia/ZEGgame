const tileSize = 90;

const slashAnim = {
    active: false,
    x: 0,
    y: 0,
    frame: 0,
    maxFrames: 5,         
    frameTimer: 0,
    frameDuration: 0.03,  
    sprite: new Image()
};
slashAnim.sprite.src = 'ui/assets/slash.png'; 

function triggerSlashEffect(px, py) {
    slashAnim.active = true;
    slashAnim.x = px;
    slashAnim.y = py;
    slashAnim.frame = 0;
    slashAnim.frameTimer = 0;
}

const GameState = { 
    MENU: 'MENU', 
    MAZE: 'MAZE', 
    ROOM: 'ROOM', 
    TRANSITION: 'TRANSITION',
    DEAD: 'DEAD',
    CUTSCENE: 'CUTSCENE',
    END: 'END',
};

const PLAYER_CONFIG = {
    MAX_HP: 3,
    START_X: 1,
    START_Y: 1,
    SPEED: 450,
    SPRITE_PATH: 'ui/assets/mc.png', 
    FRAME_WIDTH: 90,                  
    FRAME_HEIGHT: 90,                 
    ANIM_SPEED: 0.07
};

const ENEMY_CONFIG = {
    SPEED: 400,
    HEAR_RANGE: 2.5,
    ATTACK_COOLDOWN: 1500, 
    KNOCKBACK_TIME: 1000, 
    LOOK_TIME: 1.0, 
    SPRITE_PATH: 'ui/assets/enemy.png',  
    ANIM_SPEED: 0.1 
};

const MSG_CONFIG = {
    TYPING_SPEED: 40,
    CLOSE_DELAY: 100,
    INIT_DELAY: 150
};
