const ObjectsLibrary = {
    trap_spikes: {
        color: "#555",
        logicType: "trap",
    },
    maze_coin: {
        id: "maze_coin",
        color: "#ffd700",
        logicType: "maze_pickup", 
        scoreValue: 10
    },
    maze_medkit: {
        id: "maze_medkit",
        color: "#ff4444",
        isConsumable: true,
        logicType: "maze_pickup",
        effect: 'heal'
    },
    crate: {
        id: 'crate',
        logicType: "maze_pickup", 
        action: (obj) => {
            if (obj.id === "pressure_button" && obj.state === "empty") {
                obj.state = 'with_crate';
                roomsData["12"].isLocked = false;
                return {
                    message: t.interactions.crate_on_button,
                    deleteItem: true
                };
            }
        }
    },
    stone: {
        id: 'stone',
        name: 'Камень',
        logicType: "pickup", 
        action: (obj) => {
            if (obj.id === "pressure_button" && obj.state === "with_crate") {
                obj.state = 'broken';
                return {
                    message: t.interactions.stone_break_crate,
                    deleteItem: true
                };
            }
        }
    },
    pressure_button: { 
        id: 'pressure_button', 
        state: 'empty', 
        hasKey: true,
        logicType: 'button_logic',
    },
    rusty_key: {
        id: 'rusty_key',
        name: 'Ржавый ключ',
        color: '#8B4513',
    }
};

