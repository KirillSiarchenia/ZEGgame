const INITIAL_ROOMS_DATA = {
    "11": {
        isLocked: false,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [
                    { id: "pressure_button", x: 600, y: 600},
                ]
            },
            left: {
                bg: "#1a1a1a",
                objects: [
                    { id: "herb", x: 600, y: 600},
                ]
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
                    {id: "stone", x: 384, y: 700},
                ]
            },
            right: {
                bg: "#1a1a1a",
                objects: [
                    { id: "herb", x: 600, y: 600},
                ]
            }
        }
    },
    "21": {
        isLocked: false,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [
                    { id: "gears", x: 960, y: 432}
                ]
            },
            left: { bg: "#1a1a1a", objects: [] },
            right: { 
                bg: "#1a1a1a", 
                objects: [
                    { id: "herb", x: 600, y: 600},
                ] 
            }
        }
    },
    "22": {
        isLocked: true,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [ ]
            },
            left: { 
                bg: "#1a1a1a", 
                objects: [
                    { id: "herb", x: 600, y: 600},
                ] 
            },
            right: { 
                bg: "#1a1a1a", 
                objects: [
                    { id: "broken_lever", x: 960, y: 540 }
                ]
             }
        }
    },
    "23": {
        isLocked: true,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [
                    { id: "rusty_key", x: 960, y: 540 }
                ]
            },
            left: { bg: "#1a1a1a", objects: [] },
            right: { bg: "#1a1a1a", objects: [] }
        }
    },
    "31": {
        isLocked: false,
        views: {
            center: {
                bg: "#1a1a1a",
                objects: [
                    { id: "statue_head", x: 960, y: 241  },
                    { id: "statue_torso", x: 960, y: 418  },
                    { id: "statue_legs", x: 960, y: 662.5 }
                ]
            },
            left: { bg: "#1a1a1a", objects: [] },
            right: { bg: "#1a1a1a", objects: [] }
        }
    },
    "32": {
        isLocked: false,
        views: {
            center: { bg: "#1a1a1a", objects: [{ id: "herb", x: 600, y: 600}] },
            left: { bg: "#1a1a1a", objects: [{ id: "ruby", x: 960, y: 540}] },
            right: { bg: "#1a1a1a", objects: [] }
        }
    },
    "33": {
        isLocked: false,
        views: {
            center: { bg: "#1a1a1a", objects: [] },
            left: { bg: "#1a1a1a", objects: [] },
            right: { bg: "#1a1a1a", objects: [{ id: "spoon", x: 960, y: 540 }] }
        }
    },
};

let roomsData = {};