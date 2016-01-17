function DeathScene(context) {

}

function SnakeScene(context) {

    // constants
    var GAME_STATE_NORMAL = 0x0000;
    var GAME_STATE_DEATH = 0x0001;

    var canvas = context.canvas;

    var dots = { w: 54, h: 36 };
    var pixelsPerDot = { w: canvas.width / dots.w, h: canvas.height / dots.h };

    var m_currentDirection = [1, 0];
    var m_lastTicksUpdated = 0;
    var m_currentSnake = [
        { x: -1 + dots.w / 2, y: -2 + dots.h / 2 },
        { x: -1 + dots.w / 2, y: -1 + dots.h / 2 },
        { x: -1 + dots.w / 2, y: 0 + dots.h / 2 },
        { x: -1 + dots.w / 2, y: 1 + dots.h / 2 },
        { x: -1 + dots.w / 2, y: 2 + dots.h / 2 },
        { x: 0 + dots.w / 2, y: 2 + dots.h / 2 },
        { x: 1 + dots.w / 2, y: 2 + dots.h / 2 },
    ];

    var m_gameState = GAME_STATE_NORMAL;
    var m_waitForNextUpdate = false;

    var m_snakeIncreaseSize = false;
    var m_currentFood = { x: 3 + dots.w / 2, y: 2 + dots.h / 2 };
    var m_currentFrameUpdate = 300;
    var m_maximumUpdateRate = 25;
    var m_snakeColorTable = [ "#fff", "#aaa" ];
    var m_snakeColorIndex = 0;
    var m_nextDirectionUpdate = m_currentDirection;
    this.drawQuadAt = function (x, y) {
        // draw quad at coords
        context.fillRect(
            pixelsPerDot.w * x,
            pixelsPerDot.h * y,
            pixelsPerDot.w,
            pixelsPerDot.h);
    };

    this.updateFoodPosition = function () {
        m_currentFood = { x: Math.floor(Math.random() * dots.w), y: Math.floor(Math.random() * dots.h) };
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
                m_currentSnake.push({ x: last.x + m_currentDirection[0], y: last.y + m_currentDirection[1] });
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
                }
            }

            m_lastTicksUpdated = ticks;
            m_waitForNextUpdate = false;
        }
    };

    this.draw = function () {

        switch (m_gameState) {
            case GAME_STATE_NORMAL:
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillStyle = m_snakeColorTable[m_snakeColorIndex];
                for (var i = 0; i < m_currentSnake.length; i++) {
                    var item = m_currentSnake[i];
                    this.drawQuadAt(item.x, item.y);
                }

                // draw food
                context.fillStyle = "#0ae";
                this.drawQuadAt(m_currentFood.x, m_currentFood.y);
                break;
            case GAME_STATE_DEATH:
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.fillText("GAME OVER", 15, 15);
                break;
            default:
                break;
        }
    };
}

(function () {
    var canvas = document.createElement("canvas");
    canvas.style.backgroundColor = "#000";
    canvas.width = 1080;
    canvas.height = 720;
    document.body.appendChild(canvas);
    var context = canvas.getContext("2d");

    var snakeScene = new SnakeScene(context);

    document.body.addEventListener("keydown", function (ev) {
        snakeScene.onKeyPress(ev);
    });

    // set up draw loop
    var i = 0;
    var lastDrawTick = 0;
    var showFPS = false;
    var drawLoop = function (ticks) {

        snakeScene.update(ticks);
        snakeScene.draw();

        i++;
        if (showFPS && i % 60 == 0) {
            console.info("fps: " + (60000 / (ticks - lastDrawTick)).toString());
            lastDrawTick = ticks;
        }
        window.requestAnimationFrame(drawLoop);
    };

    window.requestAnimationFrame(drawLoop);
})();

/*
    TODO: minhoca teleporta quando bate na parede
    TODO: score
    TODO: reset (metodo que eu chamo e o jogo reinicia)
    TODO: callbacks de iniciou, morreu, comeu..
*/