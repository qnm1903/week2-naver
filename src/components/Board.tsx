import { memo } from 'react';
import Square from './Square';

interface BoardProps {
  board: number[];
  onSquareClick: (index: number) => void;
  disabled: boolean;
  winningLine: number[];
}

// Prevent re-render when props haven't changed
const Board = memo(function Board({ board, onSquareClick, disabled, winningLine }: BoardProps) {
  
  return (
    <div className="grid grid-cols-5 gap-3 w-full max-w-3xl mx-auto p-4 bg-black/20 rounded-2xl border border-white/10">
      {Array(25).fill(null).map((_, i) => (
        <Square
          key={i}
          value={board[i]}
          onClick={() => onSquareClick(i)}
          disabled={disabled}
          isWinning={winningLine.includes(i)}
        />
      ))}
    </div>
  );
});

export default Board;