const roomsData = {
    "map1": {
        "0,6": {
            views: {
                center: {
                    bg: "#1a1a1a",
                    objects: [
                        { 
                            id: "red_key", 
                            name: "Красный ключ", 
                            logicType: "pickup", 
                            color: "red",
                            rx: 0.45, ry: 0.5, rw: 0.05, rh: 0.05 
                        },
                        { 
                            id: "blue_gem", 
                            name: "Синий камень", 
                            logicType: "pickup", 
                            color: "blue", 
                            rx: 0.2, ry: 0.7, rw: 0.05, rh: 0.05 
                        },
                        { 
                            id: "floor_spikes", 
                            logicType: "trap", 
                            rx: 0.7, ry: 0.7, rw: 0.1, rh: 0.1 
                        }
                    ]
                },
                left: {
                    bg: "#1a1a1a",
                    objects: []
                },
                right: {
                    bg: "#1a1a1a",
                    objects: []
                }
            }
        }
    }
};