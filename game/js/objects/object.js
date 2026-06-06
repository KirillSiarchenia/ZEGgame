const ObjectLogic = {

    // логика подбора предмета в комнате | logika podnoszenia przedmiotu w pokoju
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

    // логика взаимодействия с кнопкой-переключателем | logika interakcji z przyciskiem-przełącznikiem
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
                target.state = 'damaged';
            }
        } else if (target.state === "empty") {
            UI.showMessage(t.interactions.button_examine);
        } else if (target.state === 'damaged') {
            UI.showMessage(t.interactions.button_damaged);
        }
    },

    // Obsługa zaciętych kół zębatych
    gears_logic: (target) => {
        if (target.state === 'jammed_stone' || target.state === 'jammed_bone') {
            let itemName = target.state === 'jammed_stone' ? t.itemName.stone : t.itemName.bone;
            UI.showConfirm(`${t.interactions.take_out_prompt} ${itemName}?`, () => {
                if (target.state === 'jammed_stone') {
                    Inventory.addItem({ ...ObjectsLibrary['stone'] });
                } else {
                    Inventory.addItem({ ...ObjectsLibrary['bone'] });
                }
                target.state = 'spinning';
                roomsData["22"].isLocked = true;
                UI.showMessage(t.interactions.item_taken);
            });
        } else if (target.state === 'spinning') {
            UI.showMessage(t.interactions.gears_spinning);
        }
    },

    // Logika działania dźwigni
    lever_logic: (target) => {
        if (target.state === 'broken') {
            UI.showMessage(t.interactions.lever_broken);
        } else if (target.state === 'fixed_off') {
            target.state = 'fixed_on';
            SoundManager.play('buttton');
            roomsData["23"].isLocked = false;
            UI.showMessage(t.interactions.lever_pulled_on);
        } else if (target.state === 'fixed_on') {
            target.state = 'fixed_off';
            SoundManager.play('buttton');
            roomsData["23"].isLocked = true;
            UI.showMessage(t.interactions.lever_pulled_off);
        }
    },

    // Kontrola stanu głowy posągu
    statue_head_logic: (target) => {
        if (target.state === 'empty') {
            UI.showMessage(t.interactions.statue_head_empty);
        } else if (target.state === 'ruby_only' || target.state === 'eye_only') {
            UI.showMessage(t.interactions.statue_one_eye);
        } else {
            UI.showMessage(t.interactions.head_fixed);
        }
    },

    // Logika obracania segmentów posągu
    statue_segment_logic: (target) => {
        const room = roomsData["31"];
        const head = room.views.center.objects.find(o => o.id === 'statue_head');
        const torso = room.views.center.objects.find(o => o.id === 'statue_torso');
        const legs = room.views.center.objects.find(o => o.id === 'statue_legs');

        if (torso.state === 'open' || torso.state === 'broken') {
            if (target.id === 'statue_torso') {
                UI.showMessage(t.interactions.fist_empty);
            }
            return;
        }

        if (head.state !== 'both_eyes') {
            UI.showMessage(t.interactions.statue_segment_stuck);
            return;
        }

        let currentRot = parseInt(target.state.split('_')[1]);
        currentRot = (currentRot + 1) % 3;
        target.state = `rot_${currentRot}`;

        SoundManager.play('statue');

        if (torso.state === 'rot_0' && legs.state === 'rot_0') {
            torso.state = 'open'; 
            Inventory.addItem({ ...ObjectsLibrary['rusty_key'] });
            UI.showMessage(t.interactions.statue_solved_key);
        }
    },
};