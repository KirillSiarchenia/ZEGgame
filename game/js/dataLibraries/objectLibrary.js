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
                SoundManager.play('button');
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
                SoundManager.play('crate');
                return { message: t.interactions.stone_break_crate, deleteItem: false };
            }
            if (obj.id === "gears" && obj.state === "spinning") {
                obj.state = 'jammed_stone';
                roomsData["22"].isLocked = false;
                return { message: t.interactions.gears_jammed, deleteItem: true };
            }
            if (obj.id === "statue_torso" && obj.state.startsWith('rot_')) {
                const room = roomsData["31"];
                const head = room.views.center.objects.find(o => o.id === 'statue_head');
                
                if (head && head.state !== 'empty') {
                    return { message: t.interactions.fist_protected, deleteItem: false };
                }
                
                obj.state = 'broken';
                Inventory.addItem({ ...ObjectsLibrary['rusty_key'] });
                return { message: t.interactions.fist_broken_key, deleteItem: false };
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
    ruby: {
        id: 'ruby',
        spriteIndex: 5,
        logicType: "pickup",
        action: (obj) => {
            if (obj.id === 'statue_head') {
                if (obj.state === 'empty') {
                    obj.state = 'ruby_only';
                    return { message: t.interactions.eye_inserted_one, deleteItem: true };
                } else if (obj.state === 'eye_only') {
                    obj.state = 'both_eyes';
                    return { message: t.interactions.eye_inserted_both, deleteItem: true };
                }
            }
        }
    },
    spoon: {
        id: 'spoon',
        spriteIndex: 6, 
        isConsumable: true, 
        hideFromHUD: true,
        logicType: "pickup",
        action: () => {
            if (player.missingEye) {
                return { message: t.interactions.already_blind, deleteItem: false };
            }
            
            UI.showConfirm(t.interactions.extract_eye_prompt, () => {
                player.missingEye = true;
                player.hp -= 1;
                player.visionRadius = 300;
                Inventory.addItem({ ...ObjectsLibrary['player_eye'] });
                SoundManager.play('eye');
                UI.showMessage(t.interactions.eye_extracted);
            });
            return {};
        }
    },
    player_eye: {
        id: 'player_eye',
        spriteIndex: 7, 
        logicType: "pickup",
        action: (obj) => {
            if (obj.id === 'statue_head') {
                if (obj.state === 'empty') {
                    obj.state = 'eye_only';
                    return { message: t.interactions.eye_inserted_one, deleteItem: true };
                } else if (obj.state === 'ruby_only') {
                    obj.state = 'both_eyes';
                    return { message: t.interactions.eye_inserted_both, deleteItem: true };
                }
            }
        }
    },
    statue_head: {
        id: 'statue_head', w: 200, h: 200, state: 'empty', logicType: 'statue_head_logic',
        stateImages: {
            'empty':      { sheet: 'ui/assets/statue.png', index: 0 },
            'ruby_only':  { sheet: 'ui/assets/statue.png', index: 1 },
            'eye_only':   { sheet: 'ui/assets/statue.png', index: 2 },
            'both_eyes':  { sheet: 'ui/assets/statue.png', index: 3 }
        }
    },
    statue_torso: {
        id: 'statue_torso', w: 200, h: 200, state: 'rot_1', logicType: 'statue_segment_logic',
        stateImages: {
            'rot_0':  { sheet: 'ui/assets/statue.png', index: 4 }, 
            'rot_1':  { sheet: 'ui/assets/statue.png', index: 5 }, 
            'rot_2':  { sheet: 'ui/assets/statue.png', index: 6 }, 
            'open':   { sheet: 'ui/assets/statue.png', index: 7 }, 
            'broken': { sheet: 'ui/assets/statue.png', index: 8 }  
        }
    },
    statue_legs: {
        id: 'statue_legs', w: 200, h: 200, state: 'rot_2', logicType: 'statue_segment_logic',
        stateImages: {
            'rot_0': { sheet: 'ui/assets/statue.png', index: 9 },  
            'rot_1': { sheet: 'ui/assets/statue.png', index: 10 }, 
            'rot_2': { sheet: 'ui/assets/statue.png', index: 11 }  
        }
    },
    rusty_key: {
        id: 'rusty_key',
        logicType: "pickup",
        spriteIndex: 0, 
    }
};