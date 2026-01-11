'use client';

import { useState } from 'react';
import { Course } from '@/lib/types';
import { getCourseLevelColor } from '@/constants/colors';
import { scrollToYear } from '@/utils/scroll';
import { SOCIAL_LINKS, APP_INFO } from '@/constants/urls';
import { SEARCH_BAR, CLEAR_BUTTON, BADGES, LAYOUT } from '@/constants/dimensions';

interface CourseSelectorProps {
  courses: Course[];
  onClearSelection: () => void;
  onSearch: (query: string) => void;
}

/**
 * CourseSelector component renders the top panel
 * Includes title, search bar, level filters, and legend badges
 */

export default function CourseSelector({
  courses,
  onClearSelection,
  onSearch,
}: CourseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');


  const levels = [1000, 2000, 3000, 4000];
  const levelCounts = levels.map(
    (level) => courses.filter((c) => c.level === level).length
  );

  /**
   * Handle search input changes
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  /**
   * Handle clear button click - clears search and selection
   */
  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
    onClearSelection();
  };

  return (
    <div className="border-b border-white/10 relative overflow-hidden" style={{ background: '#12121f' }}>
      <div className="pl-8 pr-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
              {APP_INFO.TITLE}
            </h1>
            <p className="text-sm text-gray-400">
              {APP_INFO.SUBTITLE}
            </p>
          </div>
          <div className="flex items-center" style={{ gap: `${BADGES.GAP}px` }}>
            <a
              href={SOCIAL_LINKS.LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-lg text-blue-400 hover:text-blue-300 hover:bg-white/10 transition-all duration-200 hover:scale-110 border border-white/10 flex items-center justify-center"
              style={{
                width: `${SEARCH_BAR.HEIGHT}px`,
                height: `${SEARCH_BAR.HEIGHT}px`,
              }}
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110 border border-white/10 flex items-center justify-center"
              style={{
                width: `${SEARCH_BAR.HEIGHT}px`,
                height: `${SEARCH_BAR.HEIGHT}px`,
              }}
              aria-label="GitHub"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative" style={{ width: `${SEARCH_BAR.WIDTH}px` }}>
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ filter: 'none' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search by course code or title..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-2.5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm text-gray-100 bg-white/5 backdrop-blur-md placeholder:text-gray-500 transition-all duration-200 shadow-lg hover:bg-white/10"
                style={{ height: `${SEARCH_BAR.HEIGHT}px` }}
              />
            </div>
            <button
              onClick={handleClear}
              className="glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center justify-center"
              style={{ width: `${CLEAR_BUTTON.WIDTH}px`, height: `${CLEAR_BUTTON.HEIGHT}px` }}
              aria-label="Clear selection"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center flex-wrap" style={{ gap: `${BADGES.GAP}px` }}>
            {levels.map((level, idx) => (
              <button
                key={level}
                onClick={() => scrollToYear(level, LAYOUT.HEADER_HEIGHT)}
                className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                style={{ 
                  width: `${BADGES.WIDTH}px`,
                  height: `${BADGES.HEIGHT_LARGE}px`
                }}
              >
                <div
                  className="w-4 h-4 border rounded flex-shrink-0"
                  style={{ borderColor: getCourseLevelColor(level), borderWidth: '2px' }}
                />
                <span className="text-blue-400 font-bold">{level}</span>
                <span className="text-gray-200">({levelCounts[idx]})</span>
              </button>
            ))}
            <div 
              className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2 justify-center"
              style={{ 
                width: `${BADGES.WIDTH}px`,
                height: `${BADGES.HEIGHT_SMALL}px`
              }}
            >
              <div className="w-4 h-4 border-2 border-blue-400 bg-gradient-to-br from-blue-400/25 to-blue-500/25 rounded flex-shrink-0 ring-2 ring-blue-400/40" />
              <span className="text-gray-200 font-semibold">Selected</span>
            </div>
            <div 
              className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2 justify-center"
              style={{ 
                width: `${BADGES.WIDTH}px`,
                height: `${BADGES.HEIGHT_SMALL}px`
              }}
            >
              <div className="w-4 h-4 border border-purple-400/70 bg-gradient-to-br from-purple-400/20 to-purple-500/20 rounded flex-shrink-0 ring-1 ring-purple-400/30" />
              <span className="text-gray-200 font-semibold">Prerequisites</span>
            </div>
            <div 
              className="px-4 py-2.5 glass rounded-xl text-xs font-semibold text-gray-300 shadow-lg hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-white/10 flex items-center gap-2 justify-center"
              style={{ 
                width: `${BADGES.WIDTH}px`,
                height: `${BADGES.HEIGHT_SMALL}px`
              }}
            >
              <div className="w-4 h-4 border border-emerald-500/60 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded flex-shrink-0 ring-1 ring-emerald-500/20" />
              <span className="text-gray-200 font-semibold">Unlocks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
