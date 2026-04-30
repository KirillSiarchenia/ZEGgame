const ObjectsLibrary = {
    "key_red": {
        name: "Красный ключ",
        color: "red",
        logicType: "pickup",
        examineText: "На нем выгравировано: 'Сектор А'."
    },
    "trap_spikes": {
        name: "Шипы",
        color: "#555",
        logicType: "trap",
    },
    "maze_coin": {
        name: "Золотая монета",
        color: "#ffd700",
        logicType: "maze_pickup", // Новый тип логики
        examineText: "Старинная...",
        scoreValue: 10
    },
    "maze_medkit": {
        name: "Аптечка",
        color: "#ff4444",
        isConsumable: true,
        logicType: "maze_pickup",
        examineText: "Это может мне помочь",
        effect: 'heal'
    }
};

