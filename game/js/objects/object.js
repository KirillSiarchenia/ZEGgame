const ObjectLogic = {
    trap: (obj) => {
        if (obj.state === 'triggered') return; // Если уже сработала, ничего не делаем

        player.hp -= 1;
        UI.updateHealth(player.hp);
        
        obj.state = 'triggered';
        obj.color = "#444"; 

        const currentRoomID = maze.grid[player.gridY][player.gridX];
        const globalRoom = roomsData[currentRoomID];

        if (globalRoom) {
            for (let viewKey in globalRoom.views) {
                let view = globalRoom.views[viewKey];
                if (view.objects) {
                    const globalTrap = view.objects.find(o => o.libId === obj.libId);
                    if (globalTrap) {
                        globalTrap.state = 'triggered'; 
                    }
                }
            }
        }
    },

    pickup: (obj) => {
    if (obj.state === 'collected') return;

    obj.state = 'collected';
    obj.visible = false;

    const currentRoomID = maze.grid[player.gridY][player.gridX];
    
    if (roomsData[currentRoomID]) {
        for (let viewKey in roomsData[currentRoomID].views) {
            let view = roomsData[currentRoomID].views[viewKey];
            if (view.objects) {
                view.objects = view.objects.filter(o => o.libId !== obj.libId);
            }
        }
    }

    Inventory.addItem(obj);
}
};