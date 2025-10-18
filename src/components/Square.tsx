import { memo, useEffect, useState } from 'react';

interface SquareProps {
  value: number;
  onClick: () => void;
  disabled: boolean;
  isWinning: boolean;
}

const Square = memo(function Square({ value, onClick, disabled, isWinning }: SquareProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  // Trigger animation when value changes
  useEffect(() => {
    if (value !== prevValue && value > 0) {
      setIsAnimating(true);
      setPrevValue(value);
      
      // Remove animation class after animation completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const isEmpty = value === 0;
  const isOdd = value > 0 && value % 2 === 1;
  const isEven = value > 0 && value % 2 === 0;

  const baseStyles = `
    relative w-full min-w-[80px] min-h-[80px]
    aspect-square
    rounded-lg transition-all duration-200
    flex flex-col items-center justify-center
    cursor-pointer select-none
    ${isAnimating ? 'animate-[increment-pulse_400ms_ease-out]' : ''}
  `;

  // Empty state
  const emptyStyles = `
    bg-[rgba(45,55,72,0.3)] border border-white/[0.08]
    hover:bg-[rgba(45,55,72,0.5)] hover:border-white/[0.15]
    hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)]
  `;

  // Filled state
  const filledStyles = isOdd
    ? 'gradient-odd shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:brightness-110 hover:scale-[1.02]'
    : 'gradient-even shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:brightness-110 hover:scale-[1.02]';

  // Winning state
  const winningStyles = isWinning
    ? 'border-4 border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-[victory-pulse_1.5s_infinite] scale-105 z-10'
    : '';

  // Disabled state
  const disabledStyles = disabled
    ? 'opacity-60 cursor-not-allowed grayscale-[40%] hover:transform-none hover:brightness-100'
    : '';

  const handleClick = () => {
    if (!disabled && !isWinning) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${isEmpty ? emptyStyles : filledStyles}
        ${winningStyles}
        ${disabledStyles}
      `}
      aria-label={`Square value ${value}, ${isOdd ? 'odd' : isEven ? 'even' : 'empty'}${isWinning ? ', part of winning line' : ''}`}
    >
      {/* Number */}
      {value > 0 && (
        <span
          className="text-[72px] font-[900] leading-none text-white font-primary drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-[number-pop_300ms_cubic-bezier(0.34,1.56,0.64,1)]"
        >
          {value}
        </span>
      )}

      {/* Label */}
      {value > 0 && (
        <span
          className="
            absolute bottom-2 text-xs font-semibold uppercase tracking-wider
            text-white/80
          "
        >
          {isOdd ? 'ODD' : 'EVEN'}
        </span>
      )}
    </button>
  );
});

export default Square;