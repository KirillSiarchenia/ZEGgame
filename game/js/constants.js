const tileSize = 90;
const lightRadius = 300;

const GameState = { 
    MENU: 'MENU', 
    MAZE: 'MAZE', 
    ROOM: 'ROOM', 
    TRANSITION: 'TRANSITION',
    DEAD: 'DEAD',
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
    EYE_OFFSET: 10    // В будущем убрать к чертям нахер нафиг
};

const MSG_CONFIG = {
    TYPING_SPEED: 40,
    CLOSE_DELAY: 100,
    INIT_DELAY: 150
};

const COLORS = {
    FOG: "rgba(0, 0, 0, 1)",
    UI_BORDER: "#ff4444",
    ITEM_DEFAULT: "gold"
};