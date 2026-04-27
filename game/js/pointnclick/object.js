const ObjectLogic = {
    trap: (obj) => {
        if (obj.state === 'triggered') {
            console.log("Ловушка уже пуста.");
            return;
        }

        console.log("Ловушка! Вы получили урон.");
        player.hp -= 1; 
        obj.state = 'triggered';
        
        if (player.hp <= 0) {
            console.log("Игра окончена");
        }
    },

    pickup: (obj) => {
        if (obj.state === 'collected') return;

        console.log(`Вы подобрали: ${obj.name || "предмет"}`);
        
        if (typeof Inventory !== 'undefined') {
            Inventory.addItem(obj.itemData);
        } else {
            if (!player.inventory) player.inventory = [];
            player.inventory.push(obj.itemData || obj.id);
        }

        obj.state = 'collected'; 
        obj.visible = false;     
    }
};