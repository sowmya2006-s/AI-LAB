// Main Application Controller
class MazeVisualizer {
    constructor() {
        this.gridSize = 30;
        this.speed = 50;
        this.algorithmMode = 'both';
        this.isRunning = false;
        this.isPaused = false;

        // Grid state
        this.walls = new Set();
        this.startPos = { row: 5, col: 5 };
        this.endPos = { row: 24, col: 24 };

        // Animation state
        this.animationFrames = {
            bfs: [],
            dfs: [],
            astar: []
        };
        this.animationIdx = 0;
        this.animationInterval = null;

        // Dragging state
        this.isDragging = false;
        this.isDrawingWalls = false;
        this.dragType = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createGrids();
        this.updateGridVisibility();
    }

    setupEventListeners() {
        // Algorithm selection
        document.getElementById('algorithm-select').addEventListener('change', (e) => {
            this.algorithmMode = e.target.value;
            this.updateGridVisibility();
        });

        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            speedValue.textContent = this.speed;
        });

        // Grid size
        document.getElementById('grid-size').addEventListener('change', (e) => {
            this.gridSize = parseInt(e.target.value);
            this.resetAll();
        });

        // Buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetAll());
        document.getElementById('clear-path-btn').addEventListener('click', () => this.clearPath());
        document.getElementById('clear-walls-btn').addEventListener('click', () => this.clearWalls());
        document.getElementById('generate-maze-btn').addEventListener('click', () => this.generateMaze());
    }

    createGrids() {
        this.createGrid('bfs-grid');
        this.createGrid('dfs-grid');
    }

    createGrid(gridId) {
        const gridElement = document.getElementById(gridId);
        gridElement.innerHTML = '';
        gridElement.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        gridElement.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.grid = gridId;

                // Add event listeners
                cell.addEventListener('mousedown', (e) => this.handleMouseDown(e, row, col));
                cell.addEventListener('mouseenter', (e) => this.handleMouseEnter(e, row, col));
                cell.addEventListener('mouseup', () => this.handleMouseUp());

                // Set initial state
                if (row === this.startPos.row && col === this.startPos.col) {
                    cell.classList.add('start');
                } else if (row === this.endPos.row && col === this.endPos.col) {
                    cell.classList.add('end');
                } else if (this.walls.has(`${row},${col}`)) {
                    cell.classList.add('wall');
                }

                gridElement.appendChild(cell);
            }
        }
    }

    handleMouseDown(e, row, col) {
        if (this.isRunning) return;

        const key = `${row},${col}`;

        // Check if clicking on start or end
        if (row === this.startPos.row && col === this.startPos.col) {
            this.isDragging = true;
            this.dragType = 'start';
        } else if (row === this.endPos.row && col === this.endPos.col) {
            this.isDragging = true;
            this.dragType = 'end';
        } else {
            // Toggle wall
            this.isDrawingWalls = true;
            this.toggleWall(row, col);
        }
    }

    handleMouseEnter(e, row, col) {
        if (this.isRunning) return;

        if (this.isDragging) {
            this.moveNode(row, col);
        } else if (this.isDrawingWalls) {
            this.toggleWall(row, col, true);
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.isDrawingWalls = false;
        this.dragType = null;
    }

    toggleWall(row, col, forceAdd = false) {
        const key = `${row},${col}`;

        // Don't add walls on start or end
        if ((row === this.startPos.row && col === this.startPos.col) ||
            (row === this.endPos.row && col === this.endPos.col)) {
            return;
        }

        if (forceAdd) {
            this.walls.add(key);
        } else {
            if (this.walls.has(key)) {
                this.walls.delete(key);
            } else {
                this.walls.add(key);
            }
        }

        this.updateCellVisuals(row, col);
    }

    moveNode(row, col) {
        const key = `${row},${col}`;

        // Don't move to walls or other nodes
        if (this.walls.has(key)) return;
        if (this.dragType === 'start' && row === this.endPos.row && col === this.endPos.col) return;
        if (this.dragType === 'end' && row === this.startPos.row && col === this.startPos.col) return;

        if (this.dragType === 'start') {
            const oldPos = { ...this.startPos };
            this.startPos = { row, col };
            this.updateCellVisuals(oldPos.row, oldPos.col);
            this.updateCellVisuals(row, col);
        } else if (this.dragType === 'end') {
            const oldPos = { ...this.endPos };
            this.endPos = { row, col };
            this.updateCellVisuals(oldPos.row, oldPos.col);
            this.updateCellVisuals(row, col);
        }
    }

    updateCellVisuals(row, col) {
        const grids = ['bfs-grid', 'dfs-grid'];

        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cell) return;

            // Clear all classes
            cell.className = 'cell';

            // Add appropriate class
            const key = `${row},${col}`;
            if (row === this.startPos.row && col === this.startPos.col) {
                cell.classList.add('start');
            } else if (row === this.endPos.row && col === this.endPos.col) {
                cell.classList.add('end');
            } else if (this.walls.has(key)) {
                cell.classList.add('wall');
            }
        });
    }

    updateGridVisibility() {
        const bfsContainer = document.getElementById('bfs-container');
        const dfsContainer = document.getElementById('dfs-container');
        const visualizationArea = document.getElementById('visualization-area');

        if (this.algorithmMode === 'both') {
            bfsContainer.classList.remove('hidden');
            dfsContainer.classList.remove('hidden');
            visualizationArea.classList.remove('single-mode');
            document.getElementById('bfs-grid-title').textContent = 'Breadth-First Search (BFS)';
        } else if (this.algorithmMode === 'bfs') {
            bfsContainer.classList.remove('hidden');
            dfsContainer.classList.add('hidden');
            visualizationArea.classList.add('single-mode');
            document.getElementById('bfs-grid-title').textContent = 'Breadth-First Search (BFS)';
        } else if (this.algorithmMode === 'dfs') {
            bfsContainer.classList.add('hidden');
            dfsContainer.classList.remove('hidden');
            visualizationArea.classList.add('single-mode');
        } else if (this.algorithmMode === 'astar') {
            bfsContainer.classList.remove('hidden');
            dfsContainer.classList.add('hidden');
            visualizationArea.classList.add('single-mode');
            document.getElementById('bfs-grid-title').textContent = 'A* Search Algorithm';
        }
    }

    async start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;

        // Clear previous results
        this.clearPath();

        // Create grid for algorithms
        const grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(0));

        // Run algorithms
        const startTime = performance.now();

        if (this.algorithmMode === 'both' || this.algorithmMode === 'bfs') {
            const bfsResult = bfs(
                grid,
                this.startPos.row,
                this.startPos.col,
                this.endPos.row,
                this.endPos.col,
                this.walls
            );
            this.animationFrames.bfs = this.createAnimationFrames(bfsResult, 'bfs');
        }

        if (this.algorithmMode === 'both' || this.algorithmMode === 'dfs') {
            const dfsResult = dfs(
                grid,
                this.startPos.row,
                this.startPos.col,
                this.endPos.row,
                this.endPos.col,
                this.walls
            );
            this.animationFrames.dfs = this.createAnimationFrames(dfsResult, 'dfs');
        }

        if (this.algorithmMode === 'astar') {
            const astarResult = aStar(
                grid,
                this.startPos.row,
                this.startPos.col,
                this.endPos.row,
                this.endPos.col,
                this.walls
            );
            this.animationFrames.astar = this.createAnimationFrames(astarResult, 'astar');
        }

        const endTime = performance.now();
        this.animationIdx = 0;

        // Animate
        await this.animate();

        // Update stats
        this.updateStats(endTime - startTime);

        // Reset button states
        this.isRunning = false;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }

    createAnimationFrames(result, algorithm) {
        const frames = [];

        // Add visited frames
        result.visitedOrder.forEach(([row, col]) => {
            frames.push({
                type: 'visited',
                row,
                col,
                algorithm
            });
        });

        // Add path frames
        result.path.forEach(([row, col]) => {
            frames.push({
                type: 'path',
                row,
                col,
                algorithm
            });
        });

        return frames;
    }

    async animate() {
        const maxFrames = Math.max(
            this.animationFrames.bfs.length,
            this.animationFrames.dfs.length,
            this.animationFrames.astar.length
        );

        while (this.animationIdx < maxFrames) {
            if (!this.isRunning || this.isPaused) break;

            // Animate BFS frame
            if (this.animationIdx < this.animationFrames.bfs.length) {
                const frame = this.animationFrames.bfs[this.animationIdx];
                this.applyFrame(frame, 'bfs-grid');
            }

            // Animate DFS frame
            if (this.animationIdx < this.animationFrames.dfs.length) {
                const frame = this.animationFrames.dfs[this.animationIdx];
                this.applyFrame(frame, 'dfs-grid');
            }

            // Animate A* frame
            if (this.animationIdx < this.animationFrames.astar.length) {
                const frame = this.animationFrames.astar[this.animationIdx];
                this.applyFrame(frame, 'bfs-grid');
            }

            this.animationIdx++;
            await this.sleep(this.speed);
        }
    }

    applyFrame(frame, gridId) {
        const grid = document.getElementById(gridId);
        const cell = grid.querySelector(`[data-row="${frame.row}"][data-col="${frame.col}"]`);
        if (!cell) return;

        if (frame.type === 'visited') {
            cell.classList.add(`visited-${frame.algorithm}`);
        } else if (frame.type === 'path') {
            cell.classList.remove(`visited-${frame.algorithm}`);
            cell.classList.add(`path-${frame.algorithm}`);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    pause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');

        if (this.isPaused) {
            pauseBtn.innerHTML = '<span class="btn-icon">▶</span> Resume';
        } else {
            pauseBtn.innerHTML = '<span class="btn-icon">⏸</span> Pause';
            this.animate();
        }
    }

    clearPath() {
        const grids = ['bfs-grid', 'dfs-grid'];

        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            const cells = grid.querySelectorAll('.cell');

            cells.forEach(cell => {
                cell.classList.remove('visited-bfs', 'visited-dfs', 'path-bfs', 'path-dfs');
            });
        });

        // Reset stats
        this.updateStats(0);
        this.animationFrames = { bfs: [], dfs: [], astar: [] };
    }

    clearWalls() {
        this.walls.clear();
        this.createGrids();
    }

    resetAll() {
        this.isRunning = false;
        this.isPaused = false;
        this.walls.clear();
        this.startPos = { row: 5, col: 5 };
        this.endPos = { row: this.gridSize - 6, col: this.gridSize - 6 };
        this.animationFrames = { bfs: [], dfs: [], astar: [] };

        this.createGrids();
        this.updateStats(0);

        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }

    generateMaze() {
        const pattern = document.getElementById('maze-pattern').value;

        if (pattern === 'none') {
            this.clearWalls();
            return;
        }

        const generator = new MazeGenerator(this.gridSize, this.gridSize);
        this.walls = generator.generate(pattern);

        // Make sure start and end are not walls
        this.walls.delete(`${this.startPos.row},${this.startPos.col}`);
        this.walls.delete(`${this.endPos.row},${this.endPos.col}`);

        this.createGrids();
    }

    updateStats(time) {
        if (this.algorithmMode === 'astar') {
            const astarVisited = this.animationFrames.astar.filter(f => f.type === 'visited').length;
            const astarPathLength = this.animationFrames.astar.filter(f => f.type === 'path').length;

            document.getElementById('bfs-visited').textContent = astarVisited;
            document.getElementById('bfs-path-length').textContent = astarPathLength;
            document.getElementById('bfs-time').textContent = `${time.toFixed(2)}ms`;
        } else {
            // BFS stats
            const bfsVisited = this.animationFrames.bfs.filter(f => f.type === 'visited').length;
            const bfsPathLength = this.animationFrames.bfs.filter(f => f.type === 'path').length;

            document.getElementById('bfs-visited').textContent = bfsVisited;
            document.getElementById('bfs-path-length').textContent = bfsPathLength;
            document.getElementById('bfs-time').textContent = `${time.toFixed(2)}ms`;

            // DFS stats
            const dfsVisited = this.animationFrames.dfs.filter(f => f.type === 'visited').length;
            const dfsPathLength = this.animationFrames.dfs.filter(f => f.type === 'path').length;

            document.getElementById('dfs-visited').textContent = dfsVisited;
            document.getElementById('dfs-path-length').textContent = dfsPathLength;
            document.getElementById('dfs-time').textContent = `${time.toFixed(2)}ms`;
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new MazeVisualizer();

    // Add global mouse up listener
    document.addEventListener('mouseup', () => {
        app.handleMouseUp();
    });
});
