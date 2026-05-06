const ObjectsLibrary = {
    trap_spikes: {
        name: "Шипы",
        color: "#555",
        logicType: "trap",
    },
    maze_coin: {
        name: "Золотая монета",
        color: "#ffd700",
        logicType: "maze_pickup", 
        examineText: "Старинная...",
        scoreValue: 10
    },
    maze_medkit: {
        name: "Аптечка",
        color: "#ff4444",
        isConsumable: true,
        logicType: "maze_pickup",
        examineText: "Это может мне помочь",
        effect: 'heal'
    },
    crate: {
        id: 'crate',
        name: 'Ящик',
        logicType: "maze_pickup", 
        examineText: "Тяжёлый ящик",
        useOnTarget: 'pressure_button',
        action: (target) => {
            if (target.state === 'empty') {
                target.state = 'with_crate';
                roomsData["12"].isLocked = false;
                
                return {message: "Что за звук? Вроде что-то открылось", deleteItem: true};
            }
        }
    },
    stone: {
        id: 'stone',
        name: 'Камень',
        logicType: "pickup", 
        examineText: "Увесистый. На эти ходячие трупы не хватит, но что-то он разобьёт.",
        useOnTarget: 'pressure_button',
        action: (target) => {
            if (target.state === 'with_crate') {
                target.state = 'broken';
                console.log(target.state);
                return {message: "Ящик разбит.", deleteItem: false};
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
        name: 'Ржавый ключ',
        color: '#8B4513',
        examineText: "Старый, покрытый ржавчиной ключ. Выглядит хрупким."
    }
};

