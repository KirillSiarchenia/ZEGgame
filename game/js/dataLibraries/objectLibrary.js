const ObjectsLibrary = {
    meat: {
        id: "meat",
        spriteIndex: 3,
        isConsumable: true,
        logicType: "pickup",
        action: () => {
            player.hp = Math.min(player.hp + 1, PLAYER_CONFIG.MAX_HP);
            
            UI.updateHealth(player.hp);
            Inventory.addItem({ ...ObjectsLibrary['bone'] });
            
            return {
                message: t.ui.hp_up,
                deleteItem: true
            };
        }
    },
    bone: {
        id: 'bone',
        spriteIndex: 4,
        logicType: 'pickup',
        action: (obj) => {
        if (obj.id === "gears" && obj.state === "spinning") {
            obj.state = 'jammed_bone';
            roomsData["22"].isLocked = false;
            return {
                message: t.interactions.gears_jammed,
                deleteItem: true
            };
        }
        if (obj.id === "broken_lever" && obj.state === "broken") {
            obj.state = 'fixed_off';
            return {
                message: t.interactions.lever_fixed,
                deleteItem: true
            };
        }
    }
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
        w: 100, h: 100,
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
            if (obj.id === "gears" && obj.state === "spinning") {
                obj.state = 'jammed_stone';
                roomsData["22"].isLocked = false;
                return {
                    message: t.interactions.gears_jammed,
                    deleteItem: true
                };
            }
        }
    },
    pressure_button: { 
        id: 'pressure_button', 
        w: 600, h: 400,
        state: 'empty', 
        hasKey: true,
        logicType: 'button_logic',
        stateImages: {
            'empty':      { sheet: 'ui/assets/button-box.png', index: 0},
            'with_crate': { sheet: 'ui/assets/button-box.png', index: 1},
            'broken':     { sheet: 'ui/assets/button-box.png', index: 2},
            'damaged':    { sheet: 'ui/assets/button-box.png', index: 3}
        },
    },
    gears: {
        id: 'gears',
        w: 400, h: 400, 
        state: 'spinning',
        logicType: 'gears_logic',
        stateImages: {
            'spinning':     { sheet: 'ui/assets/gears.png', index: 0 },
            'jammed_stone': { sheet: 'ui/assets/gears.png', index: 1 },
            'jammed_bone':  { sheet: 'ui/assets/gears.png', index: 2 }
        }
    },
    broken_lever: {
        id: 'broken_lever',
        w: 150, h: 250,
        state: 'broken',
        logicType: 'lever_logic',
        stateImages: {
            'broken':    { sheet: 'ui/assets/lever.png', index: 0 },
            'fixed_off': { sheet: 'ui/assets/lever.png', index: 1 },
            'fixed_on':  { sheet: 'ui/assets/lever.png', index: 2 }
        }
    },
    rusty_key: {
        id: 'rusty_key',
        logicType: "pickup",
        spriteIndex: 0, 
    }
};