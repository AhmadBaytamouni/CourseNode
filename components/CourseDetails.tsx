'use client';

import { Course } from '@/lib/types';
import { findDependentCourses } from '@/lib/graph';
import { formatCredits } from '@/lib/courseData';

interface CourseDetailsProps {
  course: Course | null;
  allCourses: Course[];
  onClose: () => void;
  onCourseClick: (courseCode: string) => void;
}

export default function CourseDetails({
  course,
  allCourses,
  onClose,
  onCourseClick,
}: CourseDetailsProps) {
  if (!course) {
    return (
      <div className="w-full glass-strong border-l border-white/10 p-8 hidden lg:block h-full flex flex-col overflow-y-auto">
        <div className="text-center mt-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center shadow-lg border border-white/10">
            <svg
              className="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-200 font-bold text-lg">Select a course</p>
            <p className="text-sm text-gray-400 mt-1">to view details and prerequisites</p>
          </div>
        </div>
      </div>
    );
  }

  const dependentCourses = findDependentCourses(allCourses, course.id);

  return (
    <div 
      className="w-full glass-strong border-l border-white/10 flex flex-col" 
      style={{ 
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div 
        className="glass-strong border-b border-white/10 p-6 z-10 bg-[#0a0a0f]/95" 
        style={{ flexShrink: 0, flexGrow: 0 }}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{course.code}</h2>
            <p className="text-sm font-semibold text-gray-300 px-3 py-1.5 glass rounded-lg inline-block border border-white/10">
              {formatCredits(course.credits)} • {course.level}-level
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 border border-white/10 hover:border-white/20"
            aria-label="Close details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div 
        className="overflow-y-auto overflow-x-hidden" 
        style={{ 
          flex: '1 1 0%',
          minHeight: 0,
          position: 'relative',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="p-6 space-y-6 pb-8">
        <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
          <h3 className="text-lg font-bold text-gray-100">{course.title}</h3>
        </div>

        {course.description && (
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Description
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>
        )}

        {course.prerequisites.length > 0 && (
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Prerequisites ({course.prerequisites.length})
            </h4>
            <div className="space-y-2.5">
              {course.prerequisites.map((prereq, idx) => {
                const prereqCourse = allCourses.find((c) => c.id === prereq.prerequisite_id);
                if (!prereqCourse) return null;

                return (
                  <button
                    key={idx}
                    onClick={() => onCourseClick(prereqCourse.code)}
                    className="w-full text-left px-4 py-3 glass hover:bg-white/10 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-indigo-500/20 transform hover:scale-[1.02]"
                  >
                    <div className="font-bold text-sm text-blue-300 group-hover:text-blue-200">
                      {prereqCourse.code}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium group-hover:text-gray-300">
                      {prereqCourse.title}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {prereq.is_corequisite && (
                        <span className="inline-block text-xs px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-lg font-semibold border border-orange-500/30">
                          Corequisite
                        </span>
                      )}
                      {prereq.is_exclusion && (
                        <span className="inline-block text-xs px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg font-semibold border border-red-500/30">
                          Exclusion
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {dependentCourses.length > 0 && (
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Required For ({dependentCourses.length})
            </h4>
            <div className="space-y-2.5">
              {dependentCourses.map((depCourse) => (
                <button
                  key={depCourse.id}
                  onClick={() => onCourseClick(depCourse.code)}
                  className="w-full text-left px-4 py-3 glass hover:bg-white/10 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <div className="font-bold text-sm text-gray-200 group-hover:text-gray-100">
                    {depCourse.code}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium group-hover:text-gray-300">
                    {depCourse.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

