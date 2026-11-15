import type { ReactNode, MouseEventHandler } from 'react';

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  variant?: 'primary' | 'gold' | 'ghost';
  onDark?: boolean;
  small?: boolean;
  external?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  tabIndex?: number;
}

/** one button for every call to action, so spacing, focus and hover stay identical everywhere */
export function Button({ children, href, onClick, variant = 'primary', onDark, small, external, disabled, className = '', type = 'button', ...aria }: Props) {
  const cls = ['btn', variant === 'gold' && 'btn--gold', variant === 'ghost' && 'btn--ghost', onDark && 'btn--on-dark', small && 'btn--sm', className]
    .filter(Boolean)
    .join(' ');
  if (href && !disabled) {
    return (
      <a className={cls} href={href} onClick={onClick as MouseEventHandler<HTMLAnchorElement>} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...aria}>
        {children}
      </a>
    );
  }
  if (disabled) {
    return (
      <span className={cls} role="link" aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <button className={cls} type={type} onClick={onClick as MouseEventHandler<HTMLButtonElement>} {...aria}>
      {children}
    </button>
  );
}
