'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';
import { getCourseLevelColor } from '@/lib/courseData';

interface CourseSelectorProps {
  courses: Course[];
  onClearSelection: () => void;
  onSearch: (query: string) => void;
}

export default function CourseSelector({
  courses,
  onClearSelection,
  onSearch,
}: CourseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const levels = [1000, 2000, 3000, 4000];
  const levelCounts = levels.map(
    (level) => courses.filter((c) => c.level === level).length
  );

  return (
    <div className="border-b border-white/10 shadow-2xl relative overflow-hidden bg-[#1a1a2e]">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
              Carleton CS Prerequisites
            </h1>
            <p className="text-sm text-gray-400">
              Explore course prerequisites and build your academic path
            </p>
          </div>
          <button
            onClick={onClearSelection}
            className="px-8 py-3 glass-strong rounded-lg text-base font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/20"
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[320px]">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400/70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by course code or title..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm text-gray-100 bg-white/5 backdrop-blur-md placeholder:text-gray-500 transition-all duration-200 shadow-lg hover:bg-white/10"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {levels.map((level, idx) => (
              <button
                key={level}
                onClick={() => {
                  const element = document.getElementById(`year-${level}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-4 h-4 border rounded flex-shrink-0"
                  style={{ borderColor: getCourseLevelColor(level), borderWidth: '2px' }}
                />
                <span className="text-blue-400 font-bold">{level}-Level:</span>{' '}
                <span className="text-gray-200">{levelCounts[idx]}</span>
              </button>
            ))}
            <div className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded flex-shrink-0 ring-2 ring-blue-500/30" />
              <span className="text-gray-200 font-semibold">Selected Course</span>
            </div>
            <div className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2">
              <div className="w-4 h-4 border border-indigo-500/60 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded flex-shrink-0 ring-1 ring-indigo-500/20" />
              <span className="text-gray-200 font-semibold">Prerequisite</span>
            </div>
            <div className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2">
              <div className="w-4 h-4 border border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded flex-shrink-0 ring-1 ring-emerald-500/20" />
              <span className="text-gray-200 font-semibold">Unlockable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

