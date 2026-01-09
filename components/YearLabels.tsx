'use client';

import { Panel } from '@xyflow/react';

export default function YearLabels() {
  const years = [
    { number: 1, label: 'First Year', level: 1000, x: 100 },
    { number: 2, label: 'Second Year', level: 2000, x: 500 },
    { number: 3, label: 'Third Year', level: 3000, x: 900 },
    { number: 4, label: 'Fourth Year', level: 4000, x: 1300 },
  ];

  return (
    <Panel position="top-center" className="pointer-events-none">
      <div className="flex items-center justify-center gap-8 px-4 py-2">
        {years.map((year) => (
          <div
            key={year.number}
            className="glass-strong rounded-lg px-4 py-2 border border-white/20 shadow-lg"
          >
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              {year.label}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 text-center">
              {year.level}-level
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

