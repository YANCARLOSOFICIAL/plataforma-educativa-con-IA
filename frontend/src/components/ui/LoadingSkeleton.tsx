import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface LoadingSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  count?: number;
}

export function LoadingSkeleton({
  variant = 'rectangular',
  width,
  height,
  className,
  ...props
}: LoadingSkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-lg h-48 w-full',
  };

  return (
    <div
      className={clsx(baseStyles, variants[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
}

export function LoadingSkeletonGroup({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} variant="text" />
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('bg-white rounded-lg shadow-md p-6', className)}>
      <LoadingSkeleton variant="text" width="60%" className="mb-4" />
      <LoadingSkeletonGroup count={3} />
      <LoadingSkeleton variant="rectangular" height="40px" className="mt-4" />
    </div>
  );
}

export function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="text" width="200px" />
        <LoadingSkeleton variant="circular" width="40px" height="40px" />
      </div>
      <LoadingSkeletonGroup count={2} />
      <div className="flex gap-2 mt-4">
        <LoadingSkeleton variant="rectangular" width="80px" height="32px" />
        <LoadingSkeleton variant="rectangular" width="80px" height="32px" />
      </div>
    </div>
  );
}
