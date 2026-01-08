'use client';

import { Course } from '@/lib/types';
import { findDependentCourses } from '@/lib/graph';

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
      <div className="w-96 bg-gradient-to-b from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-sm border-l-2 border-indigo-200 p-8 hidden lg:block">
        <div className="text-center mt-12 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-indigo-500"
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
            <p className="text-gray-700 font-bold text-lg">Click on a course</p>
            <p className="text-sm text-gray-500 mt-1">to view details and prerequisites</p>
          </div>
        </div>
      </div>
    );
  }

  const dependentCourses = findDependentCourses(allCourses, course.id);

  return (
    <div className="w-96 bg-gradient-to-b from-white via-indigo-50/40 via-purple-50/30 via-pink-50/20 to-cyan-50/20 backdrop-blur-sm border-l-2 border-indigo-200 overflow-y-auto h-full hidden lg:block shadow-2xl">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-md border-b-2 border-indigo-200 p-6 z-10 shadow-md">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{course.code}</h2>
            <p className="text-sm font-semibold text-gray-600 px-2 py-1 bg-white/80 rounded-lg inline-block">
              {course.credits} credit{course.credits !== 1 ? 's' : ''} • {course.level}-level
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
            aria-label="Close details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
        </div>

        {course.description && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              Description
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
          </div>
        )}

        {course.prerequisites.length > 0 && (
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
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
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 hover:border-indigo-300 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                  >
                    <div className="font-bold text-sm text-indigo-900 group-hover:text-indigo-950">
                      {prereqCourse.code}
                    </div>
                    <div className="text-xs text-indigo-700 mt-1 line-clamp-1 font-medium">
                      {prereqCourse.title}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {prereq.is_corequisite && (
                        <span className="inline-block text-xs px-2.5 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-lg font-semibold border border-orange-200">
                          Corequisite
                        </span>
                      )}
                      {prereq.is_exclusion && (
                        <span className="inline-block text-xs px-2.5 py-1 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 rounded-lg font-semibold border border-red-200">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              Required For ({dependentCourses.length})
            </h4>
            <div className="space-y-2.5">
              {dependentCourses.map((depCourse) => (
                <button
                  key={depCourse.id}
                  onClick={() => onCourseClick(depCourse.code)}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 group shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                >
                  <div className="font-bold text-sm text-gray-900 group-hover:text-gray-950">
                    {depCourse.code}
                  </div>
                  <div className="text-xs text-gray-700 mt-1 line-clamp-1 font-medium">
                    {depCourse.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

