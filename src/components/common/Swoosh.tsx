import { useId } from 'react';

export function Swoosh({ className = '', reveal = false }: { className?: string; reveal?: boolean }) {
  const id = useId();
  return (
    <svg className={`swoosh ${className}`} viewBox="0 0 300 20" aria-hidden="true" {...(reveal ? { 'data-reveal': 'fade' } : {})}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#EBAF19" stopOpacity="0" />
          <stop offset="0.25" stopColor="#EBAF19" />
          <stop offset="0.5" stopColor="#F7CB55" />
          <stop offset="0.75" stopColor="#EBAF19" />
          <stop offset="1" stopColor="#EBAF19" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M2 15 C 80 2, 220 2, 298 15 C 220 7.5, 80 7.5, 2 15 Z" fill={`url(#${id})`} />
    </svg>
  );
}
