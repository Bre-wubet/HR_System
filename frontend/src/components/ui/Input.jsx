import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
          error && 'border-error-500 focus:ring-error-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
