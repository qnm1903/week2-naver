import React from 'react';

const SpectatorBanner: React.FC = () => {
  return (
    <div
      className="
        bg-[rgba(245,158,11,0.08)]
        border-l-4 border-[#F59E0B]
        rounded-r-lg px-6 py-4
        mb-6
      "
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl text-[#F59E0B] animate-[spectator-blink_6s_infinite]">
          👁️
        </span>
        <div>
          <p className="text-lg font-semibold text-white">
            You're watching this game
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpectatorBanner;