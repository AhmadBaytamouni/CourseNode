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
    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md border-2 border-indigo-200 rounded-2xl p-5 shadow-2xl z-10 hidden md:block animate-fade-in">
      <h3 className="font-bold mb-4 text-sm text-indigo-700 uppercase tracking-wider flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
        Legend
      </h3>
      <div className="space-y-3 text-xs">
        {levels.map(({ level, label }) => (
          <div key={level} className="flex items-center gap-3">
            <div
              className="w-5 h-5 border-2 rounded-lg flex-shrink-0 shadow-sm"
              style={{ borderColor: getCourseLevelColor(level), borderWidth: '3px' }}
            />
            <span className="text-gray-700 font-medium">{label}</span>
          </div>
        ))}
        <div className="border-t-2 border-indigo-100 pt-3 mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg flex-shrink-0 shadow-md ring-2 ring-blue-200/50" style={{ borderWidth: '3px' }} />
            <span className="text-gray-700 font-semibold">Selected course</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-lg flex-shrink-0 shadow-md ring-1 ring-indigo-200/30" />
            <span className="text-gray-700 font-semibold">Prerequisite</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg flex-shrink-0 shadow-md ring-1 ring-emerald-200/30" />
            <span className="text-gray-700 font-semibold">Unlockable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

