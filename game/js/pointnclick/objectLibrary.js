const ObjectsLibrary = {
    "key_red": {
        name: "Красный ключ",
        color: "red",
        logicType: "pickup",
        description: "Старый тяжелый ключ, покрытый ржавчиной. Выглядит важно.",
        examineText: "На нем выгравировано: 'Сектор А'."
    },
    "trap_spikes": {
        name: "Шипы",
        color: "#555",
        logicType: "trap",
        description: "Острые металлические колья. Лучше к ним не прикасаться.",
        examineText: "На кончиках видна засохшая кровь..."
    },
    "maze_coin": {
        name: "Золотая монета",
        color: "#ffd700",
        logicType: "maze_pickup", // Новый тип логики
        scoreValue: 10
    },
    "maze_medkit": {
        name: "Аптечка",
        color: "#ff4444",
        logicType: "maze_pickup",
        hpValue: 1
    }
};

