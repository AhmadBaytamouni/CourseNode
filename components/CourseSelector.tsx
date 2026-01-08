'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';

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
    <div className="bg-gradient-to-r from-indigo-50 via-purple-50 via-pink-50/50 via-cyan-50/50 to-emerald-50 backdrop-blur-sm border-b-2 border-indigo-200/50 shadow-xl relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Carleton CS Prerequisite Visualizer
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Click on any course to explore its prerequisites and dependencies
            </p>
          </div>
          <button
            onClick={onClearSelection}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            aria-label="Clear selection"
          >
            Clear Selection
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 relative min-w-[300px]">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400"
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
              placeholder="Search courses by code or title..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-sm text-gray-900 bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-200 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {levels.map((level, idx) => (
              <div
                key={level}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-indigo-100 rounded-xl text-xs font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <span className="text-indigo-600">{level}-level:</span> {levelCounts[idx]}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

