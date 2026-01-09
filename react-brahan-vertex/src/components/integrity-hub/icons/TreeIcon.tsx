
import React from 'react';

export const TreeIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875m0 0a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V21m-8.25-4.875h8.25M12 2.25v2.25m0 0A4.5 4.5 0 0 1 16.5 9V15h-9V9A4.5 4.5 0 0 1 12 4.5Z" />
  </svg>
);
