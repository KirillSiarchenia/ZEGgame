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

        Inventory.addItem({
            id: obj.id,
            name: obj.name,
            color: obj.color
        });

        obj.state = 'collected';
        obj.visible = false;
    }
};