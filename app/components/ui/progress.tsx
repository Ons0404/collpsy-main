"use client";

import * as React from "react";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

const Progress = ({
  value,
  max = 100,
  className = "",
  indicatorClassName = "",
}: ProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
    >
      <div
        className={`h-full w-full flex-1 bg-blue-600 transition-all ${indicatorClassName}`}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
};

export default Progress;
