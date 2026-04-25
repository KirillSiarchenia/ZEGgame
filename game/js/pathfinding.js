// весь файл для поиска пути | cały plik dla szukania drogi (a*)


const Pathfinding = {
    Node: class {
        constructor(x, y, parent = null) {
            this.x = x;
            this.y = y;
            this.parent = parent;
            this.g = 0;
            this.h = 0;
            this.f = 0;
        }
    },

    getDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },

    findPath(startX, startY, targetX, targetY, maze) {
        if (maze.isWall(targetX, targetY)) return null;
        if (startX === targetX && startY === targetY) return [];

        let openList = [];
        let closedList = new Set();

        const startNode = new this.Node(startX, startY);
        const targetNode = new this.Node(targetX, targetY);

        openList.push(startNode);

        while (openList.length > 0) {
            let currentIndex = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[currentIndex].f) currentIndex = i;
            }

            let currentNode = openList[currentIndex];

            if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
                let path = [];
                let temp = currentNode;
                while (temp.parent) {
                    path.push({ x: temp.x, y: temp.y });
                    temp = temp.parent;
                }
                return path.reverse();
            }

            openList.splice(currentIndex, 1);
            closedList.add(`${currentNode.x},${currentNode.y}`);

            const neighbors = [
                { x: currentNode.x + 1, y: currentNode.y },
                { x: currentNode.x - 1, y: currentNode.y },
                { x: currentNode.x, y: currentNode.y + 1 },
                { x: currentNode.x, y: currentNode.y - 1 }
            ];

            for (let neighborPos of neighbors) {
                if (maze.isWall(neighborPos.x, neighborPos.y) || 
                    closedList.has(`${neighborPos.x},${neighborPos.y}`)) {
                    continue;
                }

                let neighborNode = new this.Node(neighborPos.x, neighborPos.y, currentNode);
                neighborNode.g = currentNode.g + 1;
                neighborNode.h = this.getDistance(neighborNode.x, neighborNode.y, targetNode.x, targetNode.y);
                neighborNode.f = neighborNode.g + neighborNode.h;

                let existingOpen = openList.find(n => n.x === neighborNode.x && n.y === neighborNode.y);
                if (existingOpen && neighborNode.g >= existingOpen.g) continue;

                if (!existingOpen) {
                    openList.push(neighborNode);
                }
            }
        }

        return null;
    }
};