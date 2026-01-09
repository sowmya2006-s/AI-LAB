// Maze Generation Module
class MazeGenerator {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
    }

    // Generate random walls
    generateRandom(density = 0.3) {
        const walls = new Set();
        const totalCells = this.rows * this.cols;
        const wallCount = Math.floor(totalCells * density);

        while (walls.size < wallCount) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            const key = `${row},${col}`;
            walls.add(key);
        }

        return walls;
    }

    // Recursive division maze
    generateRecursiveDivision() {
        const walls = new Set();
        
        const divide = (x, y, width, height, horizontal) => {
            if (width < 2 || height < 2) return;

            if (horizontal) {
                // Divide horizontally
                const divideRow = y + Math.floor(Math.random() * (height - 1));
                const passage = x + Math.floor(Math.random() * width);

                for (let col = x; col < x + width; col++) {
                    if (col !== passage) {
                        walls.add(`${divideRow},${col}`);
                    }
                }

                divide(x, y, width, divideRow - y, !horizontal);
                divide(x, divideRow + 1, width, y + height - divideRow - 1, !horizontal);
            } else {
                // Divide vertically
                const divideCol = x + Math.floor(Math.random() * (width - 1));
                const passage = y + Math.floor(Math.random() * height);

                for (let row = y; row < y + height; row++) {
                    if (row !== passage) {
                        walls.add(`${row},${divideCol}`);
                    }
                }

                divide(x, y, divideCol - x, height, !horizontal);
                divide(divideCol + 1, y, x + width - divideCol - 1, height, !horizontal);
            }
        };

        const horizontal = this.rows < this.cols;
        divide(0, 0, this.cols, this.rows, horizontal);

        return walls;
    }

    // Spiral pattern
    generateSpiral() {
        const walls = new Set();
        let top = 0, bottom = this.rows - 1;
        let left = 0, right = this.cols - 1;
        let layer = 0;

        while (top <= bottom && left <= right) {
            // Only add walls on every other layer
            if (layer % 2 === 0) {
                // Top row
                for (let col = left; col <= right; col++) {
                    walls.add(`${top},${col}`);
                }
                // Right column
                for (let row = top + 1; row <= bottom; row++) {
                    walls.add(`${row},${right}`);
                }
                // Bottom row
                if (top < bottom) {
                    for (let col = right - 1; col >= left; col--) {
                        walls.add(`${bottom},${col}`);
                    }
                }
                // Left column
                if (left < right) {
                    for (let row = bottom - 1; row > top; row--) {
                        walls.add(`${row},${left}`);
                    }
                }
            }

            top++;
            bottom--;
            left++;
            right--;
            layer++;
        }

        return walls;
    }

    // Cross pattern
    generateCross() {
        const walls = new Set();
        const midRow = Math.floor(this.rows / 2);
        const midCol = Math.floor(this.cols / 2);

        // Vertical line
        for (let row = 0; row < this.rows; row++) {
            if (row !== midRow) {
                walls.add(`${row},${midCol}`);
            }
        }

        // Horizontal line
        for (let col = 0; col < this.cols; col++) {
            if (col !== midCol) {
                walls.add(`${midRow},${col}`);
            }
        }

        // Add some random walls
        const randomWalls = this.generateRandom(0.1);
        randomWalls.forEach(wall => walls.add(wall));

        return walls;
    }

    // Generate maze based on pattern type
    generate(pattern = 'random') {
        switch (pattern) {
            case 'random':
                return this.generateRandom();
            case 'recursive':
                return this.generateRecursiveDivision();
            case 'spiral':
                return this.generateSpiral();
            case 'cross':
                return this.generateCross();
            default:
                return new Set();
        }
    }
}
