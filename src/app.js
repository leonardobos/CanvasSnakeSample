function DeathScene(context) {

}

function SnakeScene(options) {

    // constants
    var GAME_STATE_NORMAL = 0x0000;
    var GAME_STATE_DEATH = 0x0001;

    var m_canvas = options.canvas;
    var m_context = options.canvas.getContext("2d");
    var m_dots = options.size;
    var m_pixelsPerDot = { w: m_canvas.width / m_dots.w, h: m_canvas.height / m_dots.h };

    // snake scene state
    var m_currentDirection;
    var m_lastTicksUpdated;
    var m_lastTicksPass = null;
    var m_currentSnake;
    var m_gameState;
    var m_waitForNextUpdate;
    var m_snakeIncreaseSize;
    var m_currentFood;
    var m_currentFrameUpdate;
    var m_maximumUpdateRate;
    var m_snakeColorTable;
    var m_snakeColorIndex;
    var m_snakeLastUpdatedColorTicks;
    var m_nextDirectionUpdate = m_currentDirection;
    var m_score;
    var m_waitAfterReset;

    var drawQuadAt = function (x, y) {
        // draw quad at coords
        m_context.fillRect(
            m_pixelsPerDot.w * x,
            m_pixelsPerDot.h * y,
            m_pixelsPerDot.w,
            m_pixelsPerDot.h);
    };

    var updateFoodPosition = function () {
        m_currentFood = { x: Math.floor(Math.random() * m_dots.w), y: Math.floor(Math.random() * m_dots.h) };
    };

// public:

    this.onScoreUpdate = null;
    this.onDeath = null;
    this.onEatFood = null;

    this.reset = function () {
        m_currentDirection = [-1, 0];
        m_lastTicksUpdated = 0;
        m_currentSnake = [
            { x: 0 + m_dots.w / 2, y: 2 + m_dots.h / 2 },
            { x: 0 + m_dots.w / 2, y: 1 + m_dots.h / 2 },
            { x: 0 + m_dots.w / 2, y: 0 + m_dots.h / 2 },
            { x: 0 + m_dots.w / 2, y: -1 + m_dots.h / 2 },
            { x: 0 + m_dots.w / 2, y: -2 + m_dots.h / 2 },
            { x: -1 + m_dots.w / 2, y: -2 + m_dots.h / 2 },
            { x: -2 + m_dots.w / 2, y: -2 + m_dots.h / 2 },
        ];
        m_gameState = GAME_STATE_NORMAL;
        m_waitForNextUpdate = false;
        m_snakeIncreaseSize = false;
        m_currentFood = { x: 2 + m_dots.w / 2, y: -2 + m_dots.h / 2 };
        m_currentFrameUpdate = 150;
        m_maximumUpdateRate = 5;
        m_snakeColorTable = ["#fff", "#4af"];
        m_snakeColorIndex = 0;
        m_snakeLastUpdatedColorTicks = null;
        m_snakeWaitForChangeColorFrames = 0;
        m_nextDirectionUpdate = m_currentDirection;
        m_score = 0;
        m_waitAfterReset = 1000;
    };

    this.getHeadPositionInPixels = function() {
        var l = m_currentSnake.length - 1;
        return { 
            x: m_currentSnake[l].x * m_pixelsPerDot.w, 
            y: m_currentSnake[l].y * m_pixelsPerDot.h
        };
    };

    this.moveSnakeDirection = function (x, y) {
        if (x * -1 == m_currentDirection[0] ||
            y * -1 == m_currentDirection[1]) return;
        m_nextDirectionUpdate = [x, y];
    };

    this.getScore = function () {
        return m_score;
    };

    this.update = function (ticks) {
        switch (m_gameState) {
            case GAME_STATE_DEATH:
                break;
            case GAME_STATE_NORMAL:
                if (m_lastTicksPass == null)
                    m_lastTicksPass = ticks;

                // update color index for default
                if (m_snakeLastUpdatedColorTicks == null || ticks - m_snakeLastUpdatedColorTicks >= 500) {
                    m_snakeColorIndex = 0;
                    m_snakeLastUpdatedColorTicks = ticks;
                }

                if (m_waitAfterReset > 0) {
                    m_waitAfterReset -= (ticks - m_lastTicksPass);
                }
                else if (ticks - m_lastTicksUpdated >= m_currentFrameUpdate) {
                    // score for turning
                    if(m_currentDirection[0] != m_nextDirectionUpdate[0] ||
                        m_currentDirection[1] != m_nextDirectionUpdate[1]) {
                        m_score -= 3;
                    }

                    // update direction based on last keypress
                    m_currentDirection = m_nextDirectionUpdate;


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

                                if(this.onDeath != null)
                                    this.onDeath(this);
                            }
                        }
                    }

                    // check for get food
                    {
                        var last = m_currentSnake[m_currentSnake.length - 1];
                        if (last.x == m_currentFood.x && last.y == m_currentFood.y) {
                            // found
                            // push new food
                            updateFoodPosition();

                            // increase snake size by one
                            m_snakeIncreaseSize = true;

                            // update "update rate"
                            // get 10% more closer to maximum update rate
                            m_currentFrameUpdate -= (m_currentFrameUpdate - m_maximumUpdateRate) * 0.1;

                            // add a score
                            m_score += 100;

                            if (this.onEatFood != null)
                                this.onEatFood(this);

                            m_snakeColorIndex = 1;
                            m_snakeLastUpdatedColorTicks = ticks;
                        }
                    }

                    // update score
                    {
                        m_score = Math.max(0, m_score - 1);
                    }

                    // limit bottom score

                    if (this.onScoreUpdate != null)
                        this.onScoreUpdate(this);

                    m_lastTicksUpdated = ticks;
                    m_waitForNextUpdate = false;
                }
                break;
        }

        m_lastTicksPass = ticks;
    };

    this.draw = function () {

        switch (m_gameState) {
            case GAME_STATE_NORMAL:
                m_context.clearRect(0, 0, m_canvas.width, m_canvas.height);
                m_context.fillStyle = m_snakeColorTable[m_snakeColorIndex];
                for (var i = 0; i < m_currentSnake.length; i++) {
                    var item = m_currentSnake[i];
                    drawQuadAt(item.x, item.y);
                }

                // draw food
                m_context.fillStyle = "#0ae";
                drawQuadAt(m_currentFood.x, m_currentFood.y);
                break;
            case GAME_STATE_DEATH:
                m_context.fillStyle = "#fff";
                m_context.clearRect(0, 0, m_canvas.width, m_canvas.height);
                m_context.font = "40px Arial";
                var gameOverText = "GAME OVER";
                m_context.fillText(gameOverText,
                    m_canvas.width / 2 - (m_context.measureText(gameOverText).width / 2),
                    m_canvas.height / 2);
                m_context.strokeStyle = "#f00";
                m_context.strokeText(gameOverText,
                    m_canvas.width / 2 - (m_context.measureText(gameOverText).width / 2),
                    m_canvas.height / 2);
                break;
            default:
                break;
        }
    };

// init:
    this.reset();
}

/*
    TODO: callbacks de iniciou, morreu, comeu..
*/