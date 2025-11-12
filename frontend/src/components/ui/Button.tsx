import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95';

    const variants = {
      primary:
        'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 focus:ring-primary-400 shadow-lg hover:shadow-xl dark:from-primary-500 dark:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-700',
      secondary:
        'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-900 hover:from-gray-300 hover:to-gray-400 focus:ring-gray-400 shadow-md hover:shadow-lg dark:from-gray-700 dark:to-gray-600 dark:text-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500',
      outline:
        'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:border-primary-700 focus:ring-primary-400 active:bg-primary-100 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:border-primary-300 shadow-sm hover:shadow-md',
      ghost:
        'text-gray-700 hover:bg-gray-100 focus:ring-gray-400 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700',
      danger:
        'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 focus:ring-red-400 shadow-lg hover:shadow-xl dark:from-red-500 dark:to-red-600 dark:hover:from-red-600 dark:hover:to-red-700',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-7 py-3.5 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
