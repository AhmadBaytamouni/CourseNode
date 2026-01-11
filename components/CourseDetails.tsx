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
      <div className="w-full border-l border-white/10 p-8 hidden lg:block h-full flex flex-col overflow-y-auto" style={{ background: 'transparent' }}>
        <div className="text-center mt-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/20 flex items-center justify-center shadow-lg border border-white/10">
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
            <p className="text-sm text-gray-400 mt-1">to learn more</p>
          </div>
        </div>
      </div>
    );
  }

  const dependentCourses = findDependentCourses(allCourses, course.id);

  return (
    <div 
      className="w-full border-l border-white/10 flex flex-col" 
      style={{ 
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        position: 'relative',
        zIndex: 20
      }}
    >
      <div 
        className="border-b border-white/10 p-6 z-10" 
        style={{ flexShrink: 0, flexGrow: 0, background: 'transparent' }}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{course.code}</h2>
            <h3 className="text-[22px] font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{course.title}</h3>
          </div>
          <p className="text-sm font-semibold text-gray-300 px-3 py-1.5 glass rounded-lg inline-block border border-white/10">
            {course.level}-level • {formatCredits(course.credits)}
          </p>
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
        {course.description && (
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              Description
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>
        )}

        {course.prerequisites.length > 0 && (() => {
          // Keep prerequisites in original order (don't split by logic type)
          // Group prerequisites by logic type for cleaner display, but preserve original order within groups
          const orPrereqs: typeof course.prerequisites = [];
          const andPrereqs: typeof course.prerequisites = [];
          
          // Split into groups while preserving order
          course.prerequisites.forEach(prereq => {
            if (prereq.logic_type === 'OR') {
              orPrereqs.push(prereq);
            } else {
              andPrereqs.push(prereq);
            }
          });
          
          return (
            <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                Prerequisites ({course.prerequisites.length})
              </h4>
              <div className="space-y-3">
                {/* OR Group (if any) */}
                {orPrereqs.length > 0 && (
                  <div className="space-y-2">
                    {orPrereqs.map((prereq, idx) => {
                      const prereqCourse = allCourses.find((c) => c.id === prereq.prerequisite_id);
                      if (!prereqCourse) return null;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          {idx > 0 && (
                            <div className="flex-shrink-0 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-bold border border-purple-500/30">
                              OR
                            </div>
                          )}
                          <button
                            onClick={() => onCourseClick(prereqCourse.code)}
                            className="flex-1 text-left px-4 py-3 glass hover:bg-white/10 border border-purple-500/30 hover:border-purple-400/50 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-purple-300 group-hover:text-purple-200">
                                {prereqCourse.code}
                              </div>
                              <div className="text-xs text-purple-400/80 font-semibold">
                                {formatCredits(prereqCourse.credits)}
                              </div>
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
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AND Group (if any) */}
                {andPrereqs.length > 0 && (
                  <div className="space-y-2.5">
                    {orPrereqs.length > 0 && (
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs font-bold border border-purple-500/30">
                          AND
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </div>
                    )}
                    {andPrereqs.map((prereq, idx) => {
                      const prereqCourse = allCourses.find((c) => c.id === prereq.prerequisite_id);
                      if (!prereqCourse) return null;

                      return (
                        <div key={idx}>
                          {idx > 0 && (
                            <div className="flex items-center gap-2 my-2">
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                              <div className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-semibold border border-purple-500/30">
                                AND
                              </div>
                              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            </div>
                          )}
                          <button
                            onClick={() => onCourseClick(prereqCourse.code)}
                            className="w-full text-left px-4 py-3 glass hover:bg-white/10 border border-purple-500/30 hover:border-purple-400/50 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-purple-300 group-hover:text-purple-200">
                                {prereqCourse.code}
                              </div>
                              <div className="text-xs text-purple-400/80 font-semibold">
                                {formatCredits(prereqCourse.credits)}
                              </div>
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
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {dependentCourses.length > 0 && (
          <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
              Unlocks ({dependentCourses.length})
            </h4>
            <div className="space-y-2.5">
              {dependentCourses.map((depCourse) => (
                <button
                  key={depCourse.id}
                  onClick={() => onCourseClick(depCourse.code)}
                  className="w-full text-left px-4 py-3 glass hover:bg-white/10 border border-emerald-500/30 hover:border-emerald-400/50 rounded-xl transition-all duration-200 group shadow-lg hover:shadow-emerald-500/20 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-emerald-300 group-hover:text-emerald-200">
                      {depCourse.code}
                    </div>
                    <div className="text-xs text-emerald-400/80 font-semibold">
                      {formatCredits(depCourse.credits)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium group-hover:text-emerald-300">
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

