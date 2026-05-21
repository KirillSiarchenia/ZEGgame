const INITIAL_ROOMS_DATA = {
    "11": {
        isLocked: false,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [
                    { id: "pressure_button", x: 0.45, y: 0.7},
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
    },
    "12": {
        isLocked: true,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: []
            },
            left: {
                bg: "#1a1a1a",
                objects: [
                    {id: "stone", x: 0.2, y: 0.8},
                ]
            },
            right: {
                bg: "#1a1a1a",
                objects: []
            }
        }
    },
};

let roomsData = {};