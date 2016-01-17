function DeathScene(context) {

}

function SnakeScene(context) {

    // constants
    var GAME_STATE_NORMAL = 0x0000;
    var GAME_STATE_DEATH = 0x0001;

    var m_canvas = context.canvas;
    var m_dots = { w: 54, h: 36 };
    var m_pixelsPerDot = { w: m_canvas.width / m_dots.w, h: m_canvas.height / m_dots.h };
    var m_currentDirection = [1, 0];
    var m_lastTicksUpdated = 0;
    var m_currentSnake = [
        { x: -1 + m_dots.w / 2, y: -2 + m_dots.h / 2 },
        { x: -1 + m_dots.w / 2, y: -1 + m_dots.h / 2 },
        { x: -1 + m_dots.w / 2, y: 0 + m_dots.h / 2 },
        { x: -1 + m_dots.w / 2, y: 1 + m_dots.h / 2 },
        { x: -1 + m_dots.w / 2, y: 2 + m_dots.h / 2 },
        { x: 0 + m_dots.w / 2, y: 2 + m_dots.h / 2 },
        { x: 1 + m_dots.w / 2, y: 2 + m_dots.h / 2 },
    ];
    var m_gameState = GAME_STATE_NORMAL;
    var m_waitForNextUpdate = false;
    var m_snakeIncreaseSize = false;
    var m_currentFood = { x: 3 + m_dots.w / 2, y: 2 + m_dots.h / 2 };
    var m_currentFrameUpdate = 150;
    var m_maximumUpdateRate = 5;
    var m_snakeColorTable = [ "#fff", "#aaa" ];
    var m_snakeColorIndex = 0;
    var m_nextDirectionUpdate = m_currentDirection;
    var m_score = 0;

    var drawQuadAt = function (x, y) {
        // draw quad at coords
        context.fillRect(
            m_pixelsPerDot.w * x,
            m_pixelsPerDot.h * y,
            m_pixelsPerDot.w,
            m_pixelsPerDot.h);
    };

    this.updateFoodPosition = function () {
        m_currentFood = { x: Math.floor(Math.random() * m_dots.w), y: Math.floor(Math.random() * m_dots.h) };
    };

    this.onKeyPress = function (ev) {
        switch (ev.keyCode) {
            case 37: // left
                if (m_currentDirection[0] == 1) break;
                m_nextDirectionUpdate = [-1, 0];
                break;
            case 38: // up
                if (m_currentDirection[1] == 1) break;
                m_nextDirectionUpdate = [0, -1];
                break;
            case 39: // right
                if (m_currentDirection[0] == -1) break;
                m_nextDirectionUpdate = [1, 0];
                break;
            case 40: // down
                if (m_currentDirection[1] == -1) break;
                m_nextDirectionUpdate = [0, 1];
                break;
        }
    };

    this.update = function (ticks) {
        if (ticks - m_lastTicksUpdated >= m_currentFrameUpdate) {
            // update direction based on last keypress
            m_currentDirection = m_nextDirectionUpdate;

            // cycle into 0-1-0-1
            m_snakeColorIndex = 1 - m_snakeColorIndex;

            // update position based on direction
            {
                if (!m_snakeIncreaseSize)
                    m_currentSnake = m_currentSnake.slice(1);
                m_snakeIncreaseSize = false;
                var last = m_currentSnake[m_currentSnake.length - 1];

                var toPush = {
                    x: (last.x + m_currentDirection[0]) % m_dots.w,
                    y: (last.y + m_currentDirection[1]) % m_dots.h
                }
                if (toPush.x < 0) toPush.x = m_dots.w - 1;
                if (toPush.y < 0) toPush.y = m_dots.h - 1;
                m_currentSnake.push(toPush);
            }

            // check self colision
            {
                var last = m_currentSnake[m_currentSnake.length - 1];
                for (var x = 0; x < m_currentSnake.length - 1; x++) {
                    var item = m_currentSnake[x];
                    if (item.x == last.x && item.y == last.y) {
                        m_gameState = GAME_STATE_DEATH;
                    }
                }
            }

            // check for get food
            {
                var last = m_currentSnake[m_currentSnake.length - 1];
                if(last.x == m_currentFood.x && last.y == m_currentFood.y)
                {
                    // found
                    // push new food
                    this.updateFoodPosition();

                    // increase snake size by one
                    m_snakeIncreaseSize = true;

                    // update "update rate"
                    // get 10% more closer to maximum update rate
                    m_currentFrameUpdate -= (m_currentFrameUpdate - m_maximumUpdateRate) * 0.1;

                    // add a score
                    m_score += 100;
                }
            }

            // update score
            {
                m_score += 1;
            }

            if (this.onScoreUpdate != null)
                this.onScoreUpdate(m_score);

            m_lastTicksUpdated = ticks;
            m_waitForNextUpdate = false;
        }
    };

    this.onScoreUpdate = null;

    this.draw = function () {

        switch (m_gameState) {
            case GAME_STATE_NORMAL:
                context.clearRect(0, 0, m_canvas.width, m_canvas.height);
                context.fillStyle = m_snakeColorTable[m_snakeColorIndex];
                for (var i = 0; i < m_currentSnake.length; i++) {
                    var item = m_currentSnake[i];
                    drawQuadAt(item.x, item.y);
                }

                // draw food
                context.fillStyle = "#0ae";
                drawQuadAt(m_currentFood.x, m_currentFood.y);
                break;
            case GAME_STATE_DEATH:
                context.fillStyle = "#fff";
                context.clearRect(0, 0, m_canvas.width, m_canvas.height);
                context.font = "40px Arial";
                var gameOverText = "GAME OVER";
                context.fillText(gameOverText,
                    m_canvas.width / 2 - (context.measureText(gameOverText).width / 2),
                    m_canvas.height / 2);
                context.strokeStyle = "#f00";
                context.strokeText(gameOverText,
                    m_canvas.width / 2 - (context.measureText(gameOverText).width / 2),
                    m_canvas.height / 2);
                break;
            default:
                break;
        }
    };
}

/*
    TODO: score
    TODO: reset (metodo que eu chamo e o jogo reinicia)
    TODO: callbacks de iniciou, morreu, comeu..
*/