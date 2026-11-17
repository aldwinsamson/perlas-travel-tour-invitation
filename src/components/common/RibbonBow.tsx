import { forwardRef } from 'react';

export const RibbonBow = forwardRef<SVGSVGElement>(function RibbonBow(_, ref) {
  return (
    <svg ref={ref} className="ribbon" viewBox="0 0 1400 380" role="img" aria-label="A blue satin ribbon tied in a bow, with gold and orange edges">
      <defs>
        <linearGradient id="rb-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f86e8" />
          <stop offset="0.38" stopColor="#0b5cbd" />
          <stop offset="1" stopColor="#06265f" />
        </linearGradient>
        <linearGradient id="rb-blue-d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0a4aa0" />
          <stop offset="1" stopColor="#051c4a" />
        </linearGradient>
        <linearGradient id="rb-orange" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb02e" />
          <stop offset="1" stopColor="#f0780a" />
        </linearGradient>
        <linearGradient id="rb-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id="rb-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#06163d" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter="url(#rb-shadow)">
        {/* orange under-tails */}
        <g id="rb-tail-o">
          <path d="M692 205 C650 262 590 312 505 352 L548 366 C640 330 700 282 735 222 Z" fill="url(#rb-orange)" />
          <path d="M692 205 C650 262 590 312 505 352" fill="none" stroke="#ffd37a" strokeWidth="2" opacity="0.7" />
        </g>
        <use href="#rb-tail-o" transform="translate(1400 0) scale(-1 1)" />

        {/* blue tails */}
        <g id="rb-tail-b">
          <path d="M700 200 C668 262 648 310 606 366 L552 350 C596 296 618 246 640 188 Z" fill="url(#rb-blue-d)" />
          <path d="M640 188 C618 246 596 296 552 350" fill="none" stroke="#5aa7f5" strokeWidth="2" opacity="0.5" />
        </g>
        <use href="#rb-tail-b" transform="translate(1400 0) scale(-1 1)" />

        {/* the two bands, parted on scroll */}
        <g className="band-l">
          <path d="M-20 70 C160 62 330 100 612 152 L612 218 C330 178 160 140 -20 138 Z" fill="url(#rb-blue)" />
          <path d="M-20 76 C160 70 330 108 612 160 L612 176 C330 126 160 92 -20 92 Z" fill="url(#rb-sheen)" opacity="0.55" />
          <path d="M-20 150 C160 152 330 190 612 230" fill="none" stroke="#EBAF19" strokeWidth="3.2" />
          <path d="M-20 160 C160 162 330 200 612 240" fill="none" stroke="#ffd37a" strokeWidth="1.2" opacity="0.8" />
        </g>
        <g className="band-r">
          <g transform="translate(1400 0) scale(-1 1)">
            <path d="M-20 70 C160 62 330 100 612 152 L612 218 C330 178 160 140 -20 138 Z" fill="url(#rb-blue)" />
            <path d="M-20 76 C160 70 330 108 612 160 L612 176 C330 126 160 92 -20 92 Z" fill="url(#rb-sheen)" opacity="0.55" />
            <path d="M-20 150 C160 152 330 190 612 230" fill="none" stroke="#EBAF19" strokeWidth="3.2" />
            <path d="M-20 160 C160 162 330 200 612 240" fill="none" stroke="#ffd37a" strokeWidth="1.2" opacity="0.8" />
          </g>
        </g>

        {/* bow loops */}
        <g id="rb-loop">
          <path d="M704 176 C646 58 520 14 436 56 C372 90 418 184 524 204 C596 218 654 200 704 188 Z" fill="url(#rb-blue)" />
          <path d="M696 182 C622 128 540 108 468 112 C540 152 616 180 696 196 Z" fill="#051c4a" opacity="0.4" />
          <path d="M690 150 C640 84 560 52 480 66" fill="none" stroke="#7bbcff" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
          <path d="M704 176 C646 58 520 14 436 56" fill="none" stroke="#EBAF19" strokeWidth="2" opacity="0.9" />
        </g>
        <use href="#rb-loop" transform="translate(1400 0) scale(-1 1)" />

        {/* knot */}
        <path d="M652 148 C660 134 740 134 748 148 L760 208 C762 224 638 224 640 208 Z" fill="url(#rb-blue)" />
        <path d="M664 150 C680 142 720 142 736 150" fill="none" stroke="#9ccbff" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M646 204 C680 216 720 216 754 204" fill="none" stroke="#051c4a" strokeWidth="3" opacity="0.45" />
      </g>
    </svg>
  );
});
