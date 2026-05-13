const ObjectsLibrary = {
    trap_spikes: {
        color: "#555",
        logicType: "trap",
    },
    coin: {
        id: "coin",
        color: "#ffd700",
        logicType: "pickup", 
    },
    medkit: {
        id: "medkit",
        color: "#ff4444",
        isConsumable: true,
        logicType: "pickup",
        action: () => {
            player.hp = Math.min(player.hp + 1, player.maxHp);
            UI.updateHealth(player.hp);
            
            return {
                message: t.ui.hp_up || "Здоровье восстановлено",
                deleteItem: true
            };
        }
    },
    crate: {
        id: 'crate',
        logicType: "pickup", 
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
        logicType: "pickup", 
        action: (obj) => {
            if (obj.id === "pressure_button" && obj.state === "with_crate") {
                obj.state = 'broken';
                return {
                    message: t.interactions.stone_break_crate,
                    deleteItem: false
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
        color: '#8B4513',
    }
};

