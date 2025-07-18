import React from 'react';
import { PlayIcon, RetryIcon } from './icons.tsx';

interface OverlayProps {
  title: string;
  buttonText: string;
  onButtonClick: () => void;
  showIcon?: 'play' | 'retry';
  children?: React.ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({ title, buttonText, onButtonClick, showIcon, children }) => {
  const Icon = showIcon === 'play' ? PlayIcon : RetryIcon;

  return (
    <div className="absolute inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex flex-col justify-center items-center text-center z-10">
      <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4">{title}</h1>
      {children}
      <button
        onClick={onButtonClick}
        className="mt-8 px-8 py-4 bg-cyan-400 text-slate-900 font-bold text-xl rounded-lg shadow-lg hover:bg-cyan-300 transform hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-3"
      >
        {showIcon && <Icon className="w-6 h-6" />}
        {buttonText}
      </button>
    </div>
  );
};