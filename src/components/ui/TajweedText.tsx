import React from 'react';

interface TajweedTextProps {
  text: string;
  className?: string;
  enabled?: boolean;
  forceDarkText?: boolean;
}

/**
 * Checks if token is an authentic Quranic Waqf (Stopping) symbol
 */
function isWaqfMark(char: string): boolean {
  return /^[ۚۖۗۘۙۛۜ۞ؕطجزص]$/.test(char.trim());
}

/**
 * High-fidelity Indo-Pak Rangeen Tajweed Renderer.
 * Preserves 100% Arabic cursive ligatures (never splits internal letters into broken spans).
 * Colors match authentic Pakistani 16-line Mushaf (Taj Company / Qudratullah):
 * - Pink / Magenta (#db2777): Ghunnah (نّ / مّ / ادغام بغنہ)
 * - Bright Green (#16a34a): Ikhfa & Tafkheem (مستعلیہ / خ ص ض غ ط ق ظ)
 * - Sky Blue (#0284c7): Qalqalah (قلقلہ: قْ طْ بْ جْ دْ)
 * - Red / Crimson (#dc2626): Madd (مد: ٓ / ~ / آ)
 * - Amber / Orange (#d97706): Waqf marks (ؕ ۚ ۖ ۗ ۘ ۙ)
 * - Normal: High-contrast jet black ink (#111827 / #000000)
 */
export const TajweedText: React.FC<TajweedTextProps> = ({
  text,
  className = '',
  enabled = true,
  forceDarkText = true,
}) => {
  if (!text) return null;

  // Base text color: on Mushaf parchment paper, it must ALWAYS be high-contrast crisp black ink (#111827)
  const baseTextColor = forceDarkText ? 'text-[#111827]' : 'text-[#111827] dark:text-stone-100';

  if (!enabled) {
    const cleaned = text.replace(/\[[a-z](?::\d+)?\[([^\]]*)\]/g, '$1');
    return <span className={`${baseTextColor} ${className}`}>{cleaned}</span>;
  }

  // 1. If text has AlQuran Cloud Tajweed tags: [code:...[text]] or [code[text]]
  if (/\[[a-z](?::\d+)?\[/.test(text)) {
    const parts: React.ReactNode[] = [];
    const tagRegex = /\[([a-z])(?::\d+)?\[([^\]]*)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`plain-${lastIndex}`} className={baseTextColor}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      const code = match[1];
      const content = match[2];
      let colorClass = '';

      switch (code) {
        case 'g': // Ghunnah -> Pink / Magenta
        case 'w': // Idgham with Ghunnah
        case 'i': // Iqlab
          colorClass = 'text-[#db2777] font-bold';
          break;
        case 'f': // Ikhfa -> Bright Green
          colorClass = 'text-[#16a34a] font-bold';
          break;
        case 'q': // Qalqalah -> Sky Blue
          colorClass = 'text-[#0284c7] font-bold';
          break;
        case 'o': // Obligatory Madd -> Red
        case 'm': // Necessary Madd -> Red
        case 'p': // Permissible Madd -> Red
        case 'c': // Connected Madd -> Red
          colorClass = 'text-[#dc2626] font-bold';
          break;
        case 'h': // Hamzat Wasl
        case 's': // Silent letter
        case 'l': // Lam Shamsiyyah
          colorClass = 'text-stone-500 opacity-75';
          break;
        case 'a':
        case 'u':
        case 'd':
          colorClass = 'text-[#15803d] font-bold';
          break;
        default:
          colorClass = baseTextColor;
      }

      parts.push(
        <span key={`tag-${match.index}`} className={colorClass}>
          {content}
        </span>
      );

      lastIndex = tagRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`plain-${lastIndex}`} className={baseTextColor}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return <span className={`tajweed-container ${className}`}>{parts}</span>;
  }

  // 2. Tokenize by space boundaries and Waqf marks
  // This guarantees full Arabic cursive ligature connectivity without breaking letters!
  const words = text.split(/(\s+|[ۚۖۗۘۙۛۜ۞ؕ])/u).filter(Boolean);

  return (
    <span className={`tajweed-container ${className}`}>
      {words.map((word, wIdx) => {
        // Whitespace
        if (/^\s+$/.test(word)) {
          return <span key={wIdx}>{word}</span>;
        }

        // Waqf marks (ؕ ۚ ۖ ۗ ۘ ۙ ۛ ۜ ۞) -> Golden Amber
        if (isWaqfMark(word)) {
          return (
            <span
              key={wIdx}
              className="inline-block mx-1 text-[#d97706] font-bold select-none text-[0.88em] drop-shadow-xs"
              title="رموزِ اوقاف (Waqf Mark)"
            >
              {word}
            </span>
          );
        }

        // Lafz-e-Jalalah (الله / لله) -> Emerald Green / Revered
        if (/[وفللب]?ٱ?للَّ?ٰ?[هـ][َُِ]?/u.test(word) && (word.includes('لل') || word.includes('لَّ') || word.includes('لّٰ'))) {
          return (
            <span
              key={wIdx}
              className="text-[#15803d] font-extrabold tracking-tight drop-shadow-xs"
              title="لفظِ جلالہ (Name of Allah)"
            >
              {word}
            </span>
          );
        }

        // Madd (علامتِ مد: ٓ / ~ / آ) -> Deep Red / Crimson
        if (/[\u0653~ٓ]/.test(word) || /آ/.test(word)) {
          return (
            <span
              key={wIdx}
              className="text-[#dc2626] font-bold drop-shadow-xs"
              title="مَدّ (Madd)"
            >
              {word}
            </span>
          );
        }

        // Ghunnah (نّ / مّ with Shaddah) -> Pink / Magenta
        if (/[نم]\u0651/.test(word) || /\u0651[نم]/.test(word)) {
          return (
            <span
              key={wIdx}
              className="text-[#db2777] font-bold"
              title="غنہ (Ghunnah)"
            >
              {word}
            </span>
          );
        }

        // Qalqalah (قْ طْ بْ جْ دْ with sukoon) -> Sky Blue
        if (/[قطبجد][\u0652\u06DF]/.test(word)) {
          return (
            <span
              key={wIdx}
              className="text-[#0284c7] font-bold"
              title="قلقلہ (Qalqalah)"
            >
              {word}
            </span>
          );
        }

        // Ikhfa (نْ / tanween before 15 ikhfa letters) -> Bright Green
        if (/ن[\u0652\u06DF]?[تثجدذزسشصضطظفقك]/.test(word) || /[\u064B\u064C\u064D]/.test(word)) {
          return (
            <span
              key={wIdx}
              className="text-[#16a34a] font-bold"
              title="اخفاء (Ikhfa)"
            >
              {word}
            </span>
          );
        }

        // Standard Quranic Arabic text -> Crisp high-contrast black ink
        return (
          <span key={wIdx} className={`${baseTextColor} font-semibold`}>
            {word}
          </span>
        );
      })}
    </span>
  );
};

/**
 * TajweedLegend provides the authentic Pakistani 16-line Mushaf Tajweed guide
 */
export const TajweedLegend: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2 px-3 sm:px-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-[11px] sm:text-xs select-none shadow-xs text-stone-900 dark:text-amber-100 ${className}`}
    >
      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
        <span>🎨</span>
        <span className="font-urdu text-sm font-bold">رنگین تجوید گائیڈ:</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[#db2777] font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#db2777] shrink-0 shadow-xs" />
        <span className="font-urdu text-xs sm:text-sm">🌸 غنہ (نّ / مّ)</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[#16a34a] font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] shrink-0 shadow-xs" />
        <span className="font-urdu text-xs sm:text-sm">🌿 اخفاء و تضخیم</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[#0284c7] font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shrink-0 shadow-xs" />
        <span className="font-urdu text-xs sm:text-sm">💧 قلقلہ (قطب جد)</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[#dc2626] font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] shrink-0 shadow-xs" />
        <span className="font-urdu text-xs sm:text-sm">🔥 مَدّ (علامتِ مد)</span>
      </span>

      <span className="inline-flex items-center gap-1.5 text-[#d97706] font-bold">
        <span className="w-2.5 h-2.5 rounded-full bg-[#d97706] shrink-0 shadow-xs" />
        <span className="font-urdu text-xs sm:text-sm">🟡 رموزِ اوقاف (ؕ ۚ ۖ)</span>
      </span>
    </div>
  );
};
