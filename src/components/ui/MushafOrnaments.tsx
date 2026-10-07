import React from 'react';

/**
 * Converts western numeral to Eastern Arabic numeral (١, ٢, ٣...)
 */
export function toArabicDigits(num: number | string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => (/[0-9]/.test(d) ? arabicNumerals[parseInt(d, 10)] : d))
    .join('');
}

/**
 * The authentic Al-Quran Al-Karim Octagonal Seal Brand Logo (from alquran.cloud screenshot)
 */
export const AlQuranSealLogo: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 40,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* 8-pointed Rub el Hizb geometric seal */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="shrink-0 text-emerald-800 dark:text-amber-400"
      >
        {/* Double interlocking squares forming 8-point star */}
        <rect
          x="18"
          y="18"
          width="64"
          height="64"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          rx="2"
        />
        <rect
          x="18"
          y="18"
          width="64"
          height="64"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          rx="2"
          transform="rotate(45 50 50)"
        />
        {/* Inner circle */}
        <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" />
        {/* Arabic Calligraphy "القرآن" stylized motif */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="22"
          fontFamily="Amiri, serif"
          fontWeight="bold"
          fill="currentColor"
        >
          قرآن
        </text>
      </svg>

      <div className="flex flex-col select-none">
        <span className="font-['Amiri',serif] font-bold text-base sm:text-lg text-emerald-950 dark:text-amber-100 tracking-wide leading-tight">
          الْقُرْآنُ الْكَرِيم
        </span>
        <span className="text-[11px] font-['Cormorant_Garamond',serif] italic tracking-wider text-emerald-900/80 dark:text-amber-300/80 -mt-0.5">
          Al-Qur'ān al-Karīm
        </span>
      </div>
    </div>
  );
};

/**
 * 4 Gilded Corner Leaf Arabesque Ornaments (from screenshot corners)
 */
export const MushafCornerLeaf: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ position }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right':
        return 'scale-x-[-1]';
      case 'bottom-left':
        return 'scale-y-[-1]';
      case 'bottom-right':
        return 'scale-[-1]';
      case 'top-left':
      default:
        return '';
    }
  };

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 60 60"
      className={`text-[#c59e45] ${getTransform()} pointer-events-none select-none`}
    >
      {/* Outer curved petal */}
      <path
        d="M6,6 Q38,10 46,44 Q30,22 6,6 Z"
        fill="#f4e8cb"
        stroke="#c59e45"
        strokeWidth="2"
      />
      {/* Inner curved vein */}
      <path
        d="M6,6 Q24,14 34,30"
        fill="none"
        stroke="#c59e45"
        strokeWidth="1.5"
      />
      {/* Secondary accent leaf */}
      <path
        d="M6,6 Q10,38 44,46 Q22,30 6,6 Z"
        fill="#f8f1de"
        stroke="#c59e45"
        strokeWidth="1.5"
      />
    </svg>
  );
};

/**
 * Top Ornate Royal Blue & Gold Surah Header Medallion (from screenshot)
 */
export const MushafHeaderMedallion: React.FC<{
  title?: string;
  subTitle?: string;
  surahNumber?: number;
}> = ({ title, surahNumber = 1 }) => {
  return (
    <div className="flex flex-col items-center justify-center my-4 select-none">
      {/* Upper Crosshatch Blue Ribbon (XXXXXXXX) */}
      <div className="h-6 w-36 sm:w-44 rounded-sm border border-[#d4af37] bg-mushaf-crosshatch shadow-xs mb-3" />

      {/* Main Royal Blue Banner with Central Gold Shamsah Medallion */}
      <div className="relative flex items-center justify-center w-full max-w-md">
        {/* Horizontal Royal Blue Band */}
        <div className="w-full h-8 bg-[#15366c] border-y-2 border-[#d4af37] flex items-center justify-between px-6 shadow-xs">
          {/* Left Red Rosette with Gold Rings */}
          <div className="w-8 h-8 rounded-full bg-[#9e2c2c] border-2 border-[#d4af37] flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-3.5 rounded-full bg-[#d4af37] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9e2c2c]" />
            </div>
          </div>

          {/* Right Red Rosette with Gold Rings */}
          <div className="w-8 h-8 rounded-full bg-[#9e2c2c] border-2 border-[#d4af37] flex items-center justify-center shadow-xs">
            <div className="w-3.5 h-3.5 rounded-full bg-[#d4af37] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9e2c2c]" />
            </div>
          </div>
        </div>

        {/* Central 16-Point Golden Sunburst Shamsah Medallion */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* 16-point gold starburst rays */}
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 absolute top-0 left-0 text-[#c59e45]"
            >
              {/* Outer 8-point gold star */}
              <polygon
                points="50,4 62,34 96,50 62,66 50,96 38,66 4,50 38,34"
                fill="#c59e45"
              />
              {/* Rotated 8-point gold star */}
              <polygon
                points="50,4 62,34 96,50 62,66 50,96 38,66 4,50 38,34"
                fill="#deb857"
                transform="rotate(45 50 50)"
              />
              {/* Royal Blue Inner Disc */}
              <circle cx="50" cy="50" r="26" fill="#15366c" stroke="#f6e8c3" strokeWidth="2.5" />
              {/* Golden 8-point center star */}
              <polygon
                points="50,28 55,43 72,50 55,57 50,72 45,57 28,50 45,43"
                fill="#f5da88"
              />
              {/* Center terracotta core */}
              <circle cx="50" cy="50" r="9" fill="#9e2c2c" stroke="#f5da88" strokeWidth="1.5" />
            </svg>

            {/* Center Arabic numeral for Surah / Ayah */}
            <span className="relative z-10 text-[11px] font-bold text-amber-100 font-['Amiri',serif]">
              {toArabicDigits(surahNumber)}
            </span>
          </div>
        </div>
      </div>

      {title && (
        <h3 className="mt-4 font-['Cinzel',serif] text-sm sm:text-base font-bold text-[#15366c] tracking-widest uppercase">
          {title}
        </h3>
      )}
    </div>
  );
};

/**
 * Royal Blue 8-pointed Star Verse Marker (۞ / ۝ with Arabic numeral inside)
 */
export const MushafVerseRosette: React.FC<{
  number: number;
  className?: string;
}> = ({ number, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center justify-center relative select-none align-middle mx-2.5 ${className}`}
      style={{ width: '28px', height: '28px' }}
      title={`Ayah ${number}`}
    >
      {/* 8-pointed star in cobalt blue with gold border */}
      <svg
        viewBox="0 0 100 100"
        className="w-7 h-7 absolute inset-0 text-[#173b75]"
      >
        <polygon
          points="50,6 61,33 94,50 61,67 50,94 39,67 6,50 39,33"
          fill="#173b75"
          stroke="#c59e45"
          strokeWidth="3.5"
        />
        <polygon
          points="50,6 61,33 94,50 61,67 50,94 39,67 6,50 39,33"
          fill="#173b75"
          stroke="#c59e45"
          strokeWidth="3.5"
          transform="rotate(45 50 50)"
        />
        <circle cx="50" cy="50" r="20" fill="#15366c" stroke="#c59e45" strokeWidth="2" />
      </svg>
      {/* Arabic numeral inside */}
      <span className="relative z-10 text-[11px] font-bold text-amber-100 font-['Amiri',serif] leading-none">
        {toArabicDigits(number)}
      </span>
    </span>
  );
};

/**
 * Radiant Golden Illuminated Quran Ayah End Rosette (علامتِ آیت / روضہ)
 */
export const GoldenAyahEndMarker: React.FC<{
  number: number;
  className?: string;
  size?: number;
}> = ({ number, className = '', size = 32 }) => {
  return (
    <span
      className={`inline-flex items-center justify-center relative select-none align-middle mx-1.5 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      title={`Ayah ${number}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full absolute inset-0 text-[#b45309] drop-shadow-xs"
      >
        {/* Outer 8-point subtle petal star tips */}
        <polygon
          points="50,2 62,38 98,50 62,62 50,98 38,62 2,50 38,38"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="1.5"
          opacity="0.8"
        />
        {/* Outer Ring */}
        <circle cx="50" cy="50" r="42" fill="#fffdf5" stroke="#b45309" strokeWidth="2.5" />
        {/* Inner Dashed Ring */}
        <circle cx="50" cy="50" r="35" fill="none" stroke="#d97706" strokeWidth="1.5" strokeDasharray="4 2" />
        {/* 4 Cardinal Dot Ornaments */}
        <circle cx="50" cy="12" r="2" fill="#b45309" />
        <circle cx="50" cy="88" r="2" fill="#b45309" />
        <circle cx="12" cy="50" r="2" fill="#b45309" />
        <circle cx="88" cy="50" r="2" fill="#b45309" />
      </svg>
      <span className="relative z-10 text-[11px] sm:text-[13px] font-bold text-[#78350f] font-quran-amiri leading-none">
        {toArabicDigits(number)}
      </span>
    </span>
  );
};

/**
 * Looping Golden Vine Flourish (at bottom of mushaf page in screenshot)
 */
export const MushafVineFlourish: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center my-6 select-none opacity-80 ${className}`}>
      <svg
        width="280"
        height="36"
        viewBox="0 0 340 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#c59e45]"
      >
        {/* Waving vine line with curls */}
        <path
          d="M10,22 Q35,8 60,22 T110,22 T160,22 T210,22 T260,22 T310,22 T330,22"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Loop hoops / rings */}
        <path
          d="M48,22 C48,12 72,12 72,22 M98,22 C98,12 122,12 122,22 M148,22 C148,12 172,12 172,22 M198,22 C198,12 222,12 222,22 M248,22 C248,12 272,12 272,22"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        {/* Hanging golden beads */}
        <circle cx="60" cy="12" r="3" fill="#c59e45" />
        <circle cx="110" cy="12" r="3" fill="#c59e45" />
        <circle cx="160" cy="12" r="3" fill="#c59e45" />
        <circle cx="210" cy="12" r="3" fill="#c59e45" />
        <circle cx="260" cy="12" r="3" fill="#c59e45" />

        <circle cx="85" cy="28" r="2.5" fill="#c59e45" />
        <circle cx="135" cy="28" r="2.5" fill="#c59e45" />
        <circle cx="185" cy="28" r="2.5" fill="#c59e45" />
        <circle cx="235" cy="28" r="2.5" fill="#c59e45" />
      </svg>
    </div>
  );
};
