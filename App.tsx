import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState, type Brick, type Ball, type Paddle, type Emotion } from './types.ts';
import * as C from './constants.ts';
import { Overlay } from './components/Overlay.tsx';

// Helper function to draw faces on bricks
const drawFace = (ctx: CanvasRenderingContext2D, brick: Brick) => {
    const centerX = brick.x + C.BRICK_WIDTH / 2;
    const centerY = brick.y + C.BRICK_HEIGHT / 2;
    const eyeRadius = 3;
    const eyeOffsetX = C.BRICK_WIDTH / 4.5;
    const eyeY = centerY - C.BRICK_HEIGHT / 8;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 2;

    const drawEyes = () => {
        ctx.beginPath();
        ctx.arc(centerX - eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + eyeOffsetX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
    };

    switch (brick.emotion) {
        case 'happy':
            drawEyes();
            ctx.beginPath();
            ctx.arc(centerX, eyeY + 1, C.BRICK_WIDTH / 6, 0, Math.PI, false);
            ctx.stroke();
            break;
        case 'sad':
            drawEyes();
            ctx.beginPath();
            ctx.arc(centerX, eyeY + 9, C.BRICK_WIDTH / 6, Math.PI, Math.PI * 2, false);
            ctx.stroke();
            break;
        case 'angry':
            drawEyes();
            // Eyebrows
            ctx.beginPath();
            ctx.moveTo(centerX - eyeOffsetX - 4, eyeY - 6);
            ctx.lineTo(centerX - eyeOffsetX + 4, eyeY - 3);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + eyeOffsetX + 4, eyeY - 6);
            ctx.lineTo(centerX + eyeOffsetX - 4, eyeY - 3);
            ctx.stroke();
            // Mouth
            ctx.beginPath();
            ctx.moveTo(centerX - 6, centerY + 6);
            ctx.lineTo(centerX + 6, centerY + 6);
            ctx.stroke();
            break;
        case 'surprised':
            // Wide Eyes
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX - eyeOffsetX, eyeY, eyeRadius + 1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX + eyeOffsetX, eyeY, eyeRadius + 1, 0, Math.PI * 2);
            ctx.stroke();
            // Mouth
            ctx.beginPath();
            ctx.arc(centerX, centerY + 5, 4, 0, Math.PI * 2);
            ctx.fill();
            break;
        case 'neutral':
            drawEyes();
            ctx.beginPath();
            ctx.moveTo(centerX - 6, centerY + 6);
            ctx.lineTo(centerX + 6, centerY + 6);
            ctx.stroke();
            break;
    }
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Ready);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(C.INITIAL_LIVES);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>(0);
  
  const ball = useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0 });
  const paddle = useRef<Paddle>({ x: 0 });
  const bricks = useRef<Brick[]>([]);

  const totalBricks = C.BRICK_ROW_COUNT * C.BRICK_COLUMN_COUNT;

  const resetBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    const emotions: Emotion[] = ['happy', 'sad', 'angry', 'surprised', 'neutral'];
    for (let c = 0; c < C.BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < C.BRICK_ROW_COUNT; r++) {
        newBricks.push({
          x: c * (C.BRICK_WIDTH + C.BRICK_PADDING) + C.BRICK_OFFSET_LEFT,
          y: r * (C.BRICK_HEIGHT + C.BRICK_PADDING) + C.BRICK_OFFSET_TOP,
          status: 1,
          color: C.BRICK_COLORS[r % C.BRICK_COLORS.length],
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
        });
      }
    }
    bricks.current = newBricks;
  }, []);

  const resetGame = useCallback((startPlaying: boolean) => {
    setScore(0);
    setLives(C.INITIAL_LIVES);
    resetBricks();
    paddle.current.x = (C.CANVAS_WIDTH - C.PADDLE_WIDTH) / 2;
    ball.current = {
      x: C.CANVAS_WIDTH / 2,
      y: C.CANVAS_HEIGHT - C.PADDLE_Y_OFFSET - C.PADDLE_HEIGHT - C.BALL_RADIUS,
      dx: C.INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: -C.INITIAL_BALL_SPEED,
    };
    if(startPlaying) {
      setGameState(GameState.Playing);
    } else {
      setGameState(GameState.Ready);
    }
  }, [resetBricks]);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

    // Draw Bricks
    bricks.current.forEach(brick => {
      if (brick.status === 1) {
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, C.BRICK_WIDTH, C.BRICK_HEIGHT);
        ctx.fillStyle = brick.color;
        ctx.fill();
        ctx.closePath();
        // Draw face on top
        drawFace(ctx, brick);
      }
    });

    // Draw Crocodile Paddle
    const paddleX = paddle.current.x;
    const paddleY = C.CANVAS_HEIGHT - C.PADDLE_Y_OFFSET - C.PADDLE_HEIGHT;
    const paddleH = C.PADDLE_HEIGHT;
    const paddleW = C.PADDLE_WIDTH;
    
    // Body
    ctx.fillStyle = '#15803d'; // green-700
    ctx.fillRect(paddleX, paddleY, paddleW, paddleH);
    
    // Eyes
    const eyeRadius = paddleH / 2.5;
    const eye1X = paddleX + paddleW - 45;
    const eye2X = paddleX + paddleW - 20;
    const eyeY = paddleY + paddleH / 2;
    
    // Eye Whites
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(eye1X, eyeY, eyeRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2X, eyeY, eyeRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(eye1X + 1, eyeY, eyeRadius / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eye2X + 1, eyeY, eyeRadius / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw Ball
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, C.BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#f472b6'; // pink-400
    ctx.fill();
    ctx.closePath();

    // Draw UI
    ctx.font = '20px Orbitron, sans-serif';
    ctx.fillStyle = '#f0f9ff'; // slate-100
    ctx.fillText(`Score: ${score}`, 8, 30);
    ctx.fillText(`Lives: ${lives}`, C.CANVAS_WIDTH - 85, 30);
  }, [score, lives]);

  const collisionDetection = useCallback(() => {
    // Brick collision
    for (const brick of bricks.current) {
        if (brick.status === 1) {
            if (
                ball.current.x > brick.x &&
                ball.current.x < brick.x + C.BRICK_WIDTH &&
                ball.current.y > brick.y &&
                ball.current.y < brick.y + C.BRICK_HEIGHT
            ) {
                ball.current.dy = -ball.current.dy;
                brick.status = 0;
                setScore(prevScore => prevScore + 10);
            }
        }
    }
    
    // Check for win
    if (score + 10 === totalBricks * 10) {
        setGameState(GameState.Win);
    }

    // Wall collision
    if (ball.current.x + ball.current.dx > C.CANVAS_WIDTH - C.BALL_RADIUS || ball.current.x + ball.current.dx < C.BALL_RADIUS) {
        ball.current.dx = -ball.current.dx;
    }
    if (ball.current.y + ball.current.dy < C.BALL_RADIUS) {
        ball.current.dy = -ball.current.dy;
    } else if (ball.current.y + ball.current.dy > C.CANVAS_HEIGHT - C.BALL_RADIUS - C.PADDLE_Y_OFFSET - C.PADDLE_HEIGHT) {
        // Paddle collision
        if (ball.current.x > paddle.current.x && ball.current.x < paddle.current.x + C.PADDLE_WIDTH) {
            ball.current.dy = -ball.current.dy;
            // Add angle variation
            let collidePoint = ball.current.x - (paddle.current.x + C.PADDLE_WIDTH / 2);
            ball.current.dx = collidePoint * 0.1; 
        } else { // Bottom wall collision
            setLives(prevLives => prevLives - 1);
            if (lives - 1 <= 0) {
                setGameState(GameState.GameOver);
            } else {
                ball.current = {
                    x: C.CANVAS_WIDTH / 2,
                    y: C.CANVAS_HEIGHT - C.PADDLE_Y_OFFSET - C.PADDLE_HEIGHT - C.BALL_RADIUS,
                    dx: C.INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
                    dy: -C.INITIAL_BALL_SPEED,
                };
                paddle.current.x = (C.CANVAS_WIDTH - C.PADDLE_WIDTH) / 2;
            }
        }
    }
  }, [score, lives, totalBricks]);

  const gameLoop = useCallback(() => {
    if (gameState !== GameState.Playing) return;

    ball.current.x += ball.current.dx;
    ball.current.y += ball.current.dy;

    collisionDetection();
    draw();
    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [gameState, draw, collisionDetection]);

  useEffect(() => {
    resetGame(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState === GameState.Playing) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationFrameId.current);
      draw(); // Draw final state
    }

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, gameLoop, draw]);


  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const relativeX = e.clientX - canvasRef.current.offsetLeft;
    if (relativeX > 0 && relativeX < C.CANVAS_WIDTH) {
      paddle.current.x = Math.max(0, Math.min(relativeX - C.PADDLE_WIDTH / 2, C.CANVAS_WIDTH - C.PADDLE_WIDTH));
    }
  };

  const handleStartGame = () => {
    resetGame(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-bold text-cyan-400 mb-2 tracking-wider">REACT BREAKOUT</h1>
      <div className="relative shadow-2xl shadow-cyan-500/20">
        {gameState === GameState.Ready && (
            <Overlay title="BREAKOUT" buttonText="Start Game" onButtonClick={handleStartGame} showIcon="play">
                 <p className="text-slate-300 text-lg max-w-md">Use your mouse to move the paddle. Destroy all the blocks to win.</p>
            </Overlay>
        )}
        {gameState === GameState.GameOver && (
            <Overlay title="GAME OVER" buttonText="Try Again" onButtonClick={handleStartGame} showIcon="retry">
                <p className="text-slate-200 text-2xl">Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
            </Overlay>
        )}
        {gameState === GameState.Win && (
            <Overlay title="YOU WIN!" buttonText="Play Again" onButtonClick={handleStartGame} showIcon="retry">
                <p className="text-slate-200 text-2xl">Congratulations! Your Score: <span className="text-yellow-400 font-bold">{score}</span></p>
            </Overlay>
        )}
        <canvas
          ref={canvasRef}
          width={C.CANVAS_WIDTH}
          height={C.CANVAS_HEIGHT}
          className="bg-slate-800 rounded-lg"
          onMouseMove={handleMouseMove}
        />
      </div>
    </div>
  );
};

export default App;