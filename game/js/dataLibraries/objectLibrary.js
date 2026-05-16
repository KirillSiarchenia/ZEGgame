const ObjectsLibrary = {
    trap_spikes: {
        color: "#555",
        logicType: "trap",
    },
    medkit: {
        id: "medkit",
        spriteIndex: 3,
        isConsumable: true,
        logicType: "pickup",
        action: () => {
            player.hp = Math.min(player.hp + 1, player.maxHp);
            UI.updateHealth(player.hp);
            Inventory.addItem({ ...ObjectsLibrary['bone'] });
            
            return {
                message: t.ui.hp_up || "Здоровье восстановлено",
                deleteItem: true
            };
        }
    },
    bone: {
        id: 'bone',
        spriteIndex: 4,
        color: '#e3dac9', 
        logicType: 'pickup'
    },
    crate: {
        id: 'crate',
        spriteIndex: 2,
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
        spriteIndex: 1,
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
        spriteIndex: 0, 
    }
};