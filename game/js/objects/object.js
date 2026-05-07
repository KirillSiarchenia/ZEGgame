const ObjectLogic = {
    trap: (obj) => {
        if (obj.state === 'triggered') return;

        player.hp -= 1;
        UI.updateHealth(player.hp);
        
        // изменяет состояние ловушки | zmienia stan pułapki
        obj.state = 'triggered';
        const currentRoomID = maze.grid[player.gridY][player.gridX];
        const globalRoom = roomsData[currentRoomID];
        if (globalRoom) {
            for (let viewKey in globalRoom.views) {
                let view = globalRoom.views[viewKey];
                if (view.objects) {
                    const globalTrap = view.objects.find(o => o.id === obj.id);
                    if (globalTrap) {
                        globalTrap.state = 'triggered'; 
                    }
                }
            }
        }
    },
    
    // логика подбора предметов |
    pickup: (obj) => {
        if (obj.state === 'collected') return;

        obj.state = 'collected';
        obj.visible = false;

        const currentRoomID = maze.grid[player.gridY][player.gridX];
        
        if (roomsData[currentRoomID]) {
            for (let viewKey in roomsData[currentRoomID].views) {
                let view = roomsData[currentRoomID].views[viewKey];
                if (view.objects) {
                    view.objects = view.objects.filter(o => o.id !== obj.id);
                }
            }
        }

        Inventory.addItem(obj);
    },

    button_logic: (target) => {
        if (target.state === 'broken') {
            if (target.hasKey) {
                Inventory.addItem(ObjectsLibrary['rusty_key']);
                target.hasKey = false; 
                UI.showMessage(t.interactions.found_key);
            } else {
                player.hp -= 1;
                UI.updateHealth(player.hp);
                UI.showMessage(t.interactions.empty_crate);
            }
        } else if (target.state === "empty") {
            UI.showMessage(t.interactions.button_examine);
        }
    },
};