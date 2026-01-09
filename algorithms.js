// Pathfinding Algorithms Module

// BFS Algorithm
function bfs(grid, startRow, startCol, endRow, endCol, walls) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set();
    const parent = new Map();
    const queue = [[startRow, startCol]];
    const visitedOrder = [];

    visited.add(`${startRow},${startCol}`);

    const directions = [
        [-1, 0], // up
        [0, 1],  // right
        [1, 0],  // down
        [0, -1]  // left
    ];

    while (queue.length > 0) {
        const [row, col] = queue.shift();

        // Add to visited order for visualization
        if (row !== startRow || col !== startCol) {
            visitedOrder.push([row, col]);
        }

        // Check if we reached the end
        if (row === endRow && col === endCol) {
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            const key = `${newRow},${newCol}`;

            // Check bounds
            if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
                continue;
            }

            // Check if already visited or is a wall
            if (visited.has(key) || walls.has(key)) {
                continue;
            }

            visited.add(key);
            parent.set(key, [row, col]);
            queue.push([newRow, newCol]);
        }
    }

    // Reconstruct path
    const path = [];
    let current = `${endRow},${endCol}`;

    if (parent.has(current) || (endRow === startRow && endCol === startCol)) {
        while (current) {
            const [row, col] = current.split(',').map(Number);
            if (row !== startRow || col !== startCol) {
                path.unshift([row, col]);
            }
            current = parent.get(current);
            if (current) {
                current = `${current[0]},${current[1]}`;
            }
        }
    }

    return {
        visitedOrder,
        path,
        nodesVisited: visited.size
    };
}

// DFS Algorithm
function dfs(grid, startRow, startCol, endRow, endCol, walls) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set();
    const parent = new Map();
    const stack = [[startRow, startCol]];
    const visitedOrder = [];
    let found = false;

    const directions = [
        [-1, 0], // up
        [0, 1],  // right
        [1, 0],  // down
        [0, -1]  // left
    ];

    while (stack.length > 0 && !found) {
        const [row, col] = stack.pop();
        const key = `${row},${col}`;

        // Skip if already visited
        if (visited.has(key)) {
            continue;
        }

        visited.add(key);

        // Add to visited order for visualization
        if (row !== startRow || col !== startCol) {
            visitedOrder.push([row, col]);
        }

        // Check if we reached the end
        if (row === endRow && col === endCol) {
            found = true;
            break;
        }

        // Explore neighbors (in reverse order for DFS)
        for (let i = directions.length - 1; i >= 0; i--) {
            const [dr, dc] = directions[i];
            const newRow = row + dr;
            const newCol = col + dc;
            const newKey = `${newRow},${newCol}`;

            // Check bounds
            if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
                continue;
            }

            // Check if already visited or is a wall
            if (visited.has(newKey) || walls.has(newKey)) {
                continue;
            }

            parent.set(newKey, [row, col]);
            stack.push([newRow, newCol]);
        }
    }

    // Reconstruct path
    const path = [];
    let current = `${endRow},${endCol}`;

    if (parent.has(current) || (endRow === startRow && endCol === startCol)) {
        while (current) {
            const [row, col] = current.split(',').map(Number);
            if (row !== startRow || col !== startCol) {
                path.unshift([row, col]);
            }
            current = parent.get(current);
            if (current) {
                current = `${current[0]},${current[1]}`;
            }
        }
    }

    return {
        visitedOrder,
        path,
        nodesVisited: visited.size
    };
}

// A* Algorithm (Bonus)
function aStar(grid, startRow, startCol, endRow, endCol, walls) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = new Set();
    const parent = new Map();
    const gScore = new Map();
    const fScore = new Map();
    const visitedOrder = [];

    const heuristic = (row, col) => {
        return Math.abs(row - endRow) + Math.abs(col - endCol);
    };

    const startKey = `${startRow},${startCol}`;
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(startRow, startCol));

    const openSet = [[startRow, startCol]];

    const directions = [
        [-1, 0], // up
        [0, 1],  // right
        [1, 0],  // down
        [0, -1]  // left
    ];

    while (openSet.length > 0) {
        // Find node with lowest fScore
        let currentIndex = 0;
        let lowestF = fScore.get(`${openSet[0][0]},${openSet[0][1]}`) || Infinity;

        for (let i = 1; i < openSet.length; i++) {
            const key = `${openSet[i][0]},${openSet[i][1]}`;
            const f = fScore.get(key) || Infinity;
            if (f < lowestF) {
                lowestF = f;
                currentIndex = i;
            }
        }

        const [row, col] = openSet.splice(currentIndex, 1)[0];
        const currentKey = `${row},${col}`;

        if (visited.has(currentKey)) {
            continue;
        }

        visited.add(currentKey);

        // Add to visited order for visualization
        if (row !== startRow || col !== startCol) {
            visitedOrder.push([row, col]);
        }

        // Check if we reached the end
        if (row === endRow && col === endCol) {
            break;
        }

        // Explore neighbors
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            const neighborKey = `${newRow},${newCol}`;

            // Check bounds
            if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
                continue;
            }

            // Check if is a wall or already visited
            if (walls.has(neighborKey) || visited.has(neighborKey)) {
                continue;
            }

            const tentativeG = (gScore.get(currentKey) || 0) + 1;

            if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)) {
                parent.set(neighborKey, [row, col]);
                gScore.set(neighborKey, tentativeG);
                fScore.set(neighborKey, tentativeG + heuristic(newRow, newCol));

                if (!openSet.some(([r, c]) => r === newRow && c === newCol)) {
                    openSet.push([newRow, newCol]);
                }
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = `${endRow},${endCol}`;

    if (parent.has(current) || (endRow === startRow && endCol === startCol)) {
        while (current) {
            const [row, col] = current.split(',').map(Number);
            if (row !== startRow || col !== startCol) {
                path.unshift([row, col]);
            }
            current = parent.get(current);
            if (current) {
                current = `${current[0]},${current[1]}`;
            }
        }
    }

    return {
        visitedOrder,
        path,
        nodesVisited: visited.size
    };
}
