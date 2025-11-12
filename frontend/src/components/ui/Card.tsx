import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-300';

    const variants = {
      default: 'bg-white dark:bg-gray-800 shadow-soft-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700',
      bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-sm',
      elevated: 'bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/40 border border-gray-100 dark:border-gray-700',
      glass: 'backdrop-blur-xl bg-white/60 dark:bg-gray-800/60 border border-white/30 dark:border-gray-700/50 shadow-glass',
      gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl border border-gray-200/50 dark:border-gray-700/50',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverStyles = hover
      ? 'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          paddings[padding],
          hoverStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
