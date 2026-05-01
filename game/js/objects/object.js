const ObjectLogic = {
    trap: (obj) => {
        if (obj.state === 'triggered') {
            console.log("Ловушка уже пуста.");
            return;
        }

        player.hp -= 1; 
        console.log("Ловушка! Вы получили урон.", player.hp);
        obj.state = 'triggered';
        UI.updateHealth(player.hp);
        
        if (player.hp <= 0) {
            console.log("Игра окончена");
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