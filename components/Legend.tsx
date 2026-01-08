'use client';

import { getCourseLevelColor } from '@/lib/courseData';

export default function Legend() {
  const levels = [
    { level: 1000, label: '1000-level' },
    { level: 2000, label: '2000-level' },
    { level: 3000, label: '3000-level' },
    { level: 4000, label: '4000-level' },
  ];

  return (
    <div className="absolute bottom-6 right-6 glass-strong border border-white/20 rounded-xl p-5 shadow-2xl z-10 hidden md:block animate-fade-in">
      <h3 className="font-bold mb-4 text-sm text-blue-400 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
        Legend
      </h3>
      <div className="space-y-3 text-xs">
        {levels.map(({ level, label }) => (
          <div key={level} className="flex items-center gap-3">
            <div
              className="w-5 h-5 border rounded-lg flex-shrink-0 shadow-sm"
              style={{ borderColor: getCourseLevelColor(level), borderWidth: '2px' }}
            />
            <span className="text-gray-300 font-medium">{label}</span>
          </div>
        ))}
        <div className="border-t border-white/20 pt-3 mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex-shrink-0 shadow-md ring-2 ring-blue-500/30" />
            <span className="text-gray-200 font-semibold">Selected course</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-indigo-500/60 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-lg flex-shrink-0 shadow-md ring-1 ring-indigo-500/20" />
            <span className="text-gray-200 font-semibold">Prerequisite</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-lg flex-shrink-0 shadow-md ring-1 ring-emerald-500/20" />
            <span className="text-gray-200 font-semibold">Unlockable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

