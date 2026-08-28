import React from 'react';

interface CustomizerPreviewProps {
  jerseyBackUrl: string;
  playerName?: string;
  playerNumber?: string;
  fontColor?: string;
}

export const CustomizerPreview: React.FC<CustomizerPreviewProps> = ({
  jerseyBackUrl,
  playerName = '',
  playerNumber = '',
  fontColor = '#FFFFFF',
}) => {
  return (
    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-surface-300 border border-white/10 shadow-2xl flex items-center justify-center select-none">
      {/* Jersey Back Base Image */}
      <img
        src={jerseyBackUrl}
        alt="Customized Jersey Back"
        className="w-full h-full object-contain"
      />

      {/* Typography Overlay Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
        {/* Name */}
        {playerName && (
          <div
            className="font-display font-black tracking-widest text-center uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] transition-all duration-300"
            style={{
              color: fontColor,
              fontSize: playerName.length > 8 ? '1.4rem' : '1.8rem',
              letterSpacing: '0.15em',
            }}
          >
            {playerName}
          </div>
        )}

        {/* Number */}
        {playerNumber && (
          <div
            className="font-display font-black tracking-tighter text-center leading-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] transition-all duration-300"
            style={{
              color: fontColor,
              fontSize: '5.5rem',
            }}
          >
            {playerNumber}
          </div>
        )}
      </div>

      {/* Authenticity Badge */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-gray-400">
        CUSTOM NAMEPRINT PREVIEW
      </div>
    </div>
  );
};
