
import React from 'react';

export const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || "w-6 h-6"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.125 2.25h3.75a.75.75 0 0 1 .75.75v1.125c0 .414.336.75.75.75h4.5a2.25 2.25 0 0 1 2.25 2.25v13.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V7.125a2.25 2.25 0 0 1 2.25-2.25h4.5c.414 0 .75-.336.75-.75V3a.75.75 0 0 1 .75-.75ZM9 8.25h6m-6 3h6m-6 3h6m-6 3h6"
    />
  </svg>
);
