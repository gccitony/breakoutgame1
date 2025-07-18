
export type Emotion = 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral';

export enum GameState {
  Ready,
  Playing,
  Paused,
  GameOver,
  Win,
}

export interface Brick {
  x: number;
  y: number;
  status: 1 | 0; // 1 for visible, 0 for broken
  color: string;
  emotion: Emotion;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export interface Paddle {
  x: number;
}
