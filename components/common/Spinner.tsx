
import React from 'react';

export const Spinner: React.FC<{ size?: string }> = ({ size = 'w-8 h-8' }) => {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-green-200 border-t-green-600`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
