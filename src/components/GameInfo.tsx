type PlayerType = 'ODD' | 'EVEN' | null;

interface GameInfoProps {
  player: PlayerType;
}

export default function GameInfo({ player }: GameInfoProps) {
  if (!player) return null;

  return (
    <div className="mt-8 grid grid-cols-2 gap-6 max-w-2xl mx-auto">
      {/* ODD Player Card */}
      <div className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        ${player === 'ODD' 
          ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 border-blue-400 shadow-xl shadow-blue-500/30 scale-105' 
          : 'bg-blue-500/5 border-blue-400/20'}
      `}>
        {player === 'ODD' && (
          <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            YOU
          </div>
        )}
        <div className="text-center">
          <div className="text-4xl mb-2">🔵</div>
          <h3 className="text-xl font-black text-blue-300 mb-2">
            ODD Player
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-200 font-medium">Clicks: 1, 3, 5, 7...</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {[1, 3, 5, 7, 9].map(num => (
                <span key={num} className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {num}
                </span>
              ))}
            </div>
            <p className="text-blue-300/80 text-xs italic mt-2">
              Win with 5 odd numbers in a line
            </p>
          </div>
        </div>
      </div>

      {/* EVEN Player Card */}
      <div className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        ${player === 'EVEN' 
          ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 border-green-400 shadow-xl shadow-green-500/30 scale-105' 
          : 'bg-green-500/5 border-green-400/20'}
      `}>
        {player === 'EVEN' && (
          <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            YOU
          </div>
        )}
        <div className="text-center">
          <div className="text-4xl mb-2">🟢</div>
          <h3 className="text-xl font-black text-green-300 mb-2">
            EVEN Player
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-green-200 font-medium">Clicks: 2, 4, 6, 8...</p>
            <div className="flex flex-wrap gap-1 justify-center">
              {[2, 4, 6, 8, 10].map(num => (
                <span key={num} className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                  {num}
                </span>
              ))}
            </div>
            <p className="text-green-300/80 text-xs italic mt-2">
              Win with 5 even numbers in a line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}