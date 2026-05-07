const tileSize = 90;

const GameState = { 
    MENU: 'MENU', 
    MAZE: 'MAZE', 
    ROOM: 'ROOM', 
    TRANSITION: 'TRANSITION' 
};

const PLAYER_CONFIG = {
    MAX_HP: 3,
    START_X: 1,
    START_Y: 1,
    SPEED: 5,
};

const ENEMY_CONFIG = {
    SPEED: 3,
    HEAR_RANGE: 2.5,
    ATTACK_COOLDOWN: 1500, 
    KNOCKBACK_TIME: 1000, 
    LOOK_TIME: 160,   
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