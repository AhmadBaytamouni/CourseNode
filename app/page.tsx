'use client';

import { useState, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Course } from '@/lib/types';
import { getAllCourses, getCourseByCode, formatCredits } from '@/lib/courseData';
import { useCourseSelection } from '@/hooks/useCourseSelection';
import { useCourseGraph } from '@/hooks/useCourseGraph';
import CourseGraph from '@/components/CourseGraph';
import CourseDetails from '@/components/CourseDetails';
import CourseSelector from '@/components/CourseSelector';
import Legend from '@/components/Legend';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    selectedCourseId,
    prerequisiteIds,
    unlockableIds,
    selectCourseWithPrerequisites,
    clearSelection,
    isSelected,
    isPrerequisite,
    isUnlockable,
    shouldFade,
  } = useCourseSelection(courses);

  const { nodes, edges, onNodesChange } = useCourseGraph(
    courses,
    selectedCourseId,
    prerequisiteIds,
    unlockableIds,
    shouldFade
  );

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  // Filter nodes and edges based on search
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    const filteredIds = new Set(filteredCourses.map((c) => c.id));
    return nodes.filter((n) => filteredIds.has(n.id));
  }, [nodes, filteredCourses, searchQuery]);

  const filteredEdges = useMemo(() => {
    if (!searchQuery) return edges;
    const filteredIds = new Set(filteredCourses.map((c) => c.id));
    return edges.filter(
      (e) => filteredIds.has(e.source) && filteredIds.has(e.target)
    );
  }, [edges, filteredCourses, searchQuery]);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
        console.error('Error loading courses:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  const handleNodeClick = (nodeId: string) => {
    const course = courses.find((c) => c.id === nodeId);
    if (course) {
      selectCourseWithPrerequisites(nodeId);
      setSelectedCourse(course);
    }
  };

  const handleCourseClick = (courseCode: string) => {
    const course = getCourseByCode(courses, courseCode);
    if (course) {
      selectCourseWithPrerequisites(course.id);
      setSelectedCourse(course);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-lg">Loading courses...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-4 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-red-600 font-bold text-xl mb-2">Error Loading Courses</p>
            <p className="text-gray-700 mb-4">{error}</p>
            <p className="text-sm text-gray-600 bg-white/80 rounded-lg p-4 border-2 border-red-200">
              Please check your Supabase configuration and ensure the database is set up correctly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <CourseSelector
        courses={courses}
        onClearSelection={clearSelection}
        onSearch={setSearchQuery}
      />

      <div className="flex-1 flex relative">
        <div className="flex-1 relative">
          <ReactFlowProvider>
            <CourseGraph
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodeClick={handleNodeClick}
              onNodesChange={onNodesChange}
            />
          </ReactFlowProvider>
          <Legend />
        </div>

        <CourseDetails
          course={selectedCourse}
          allCourses={courses}
          onClose={() => setSelectedCourse(null)}
          onCourseClick={handleCourseClick}
        />
      </div>

      {/* Mobile course details modal */}
      {selectedCourse && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          <div className="bg-gradient-to-b from-white via-indigo-50/30 to-purple-50/30 w-full max-h-[85vh] rounded-t-3xl shadow-2xl overflow-hidden border-t-2 border-indigo-200">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-md border-b-2 border-indigo-200 px-6 py-5 flex justify-between items-start shadow-md">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{selectedCourse.code}</h2>
                <p className="text-sm font-semibold text-gray-600 px-2 py-1 bg-white/80 rounded-lg inline-block">
                  {formatCredits(selectedCourse.credits)} • {selectedCourse.level}-level
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white/80 rounded-lg transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">{selectedCourse.title}</h3>
              </div>
              {selectedCourse.description && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedCourse.description}</p>
                </div>
              )}
              {selectedCourse.prerequisites.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-100 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                    Prerequisites ({selectedCourse.prerequisites.length})
                  </h4>
                  <div className="space-y-2.5">
                    {selectedCourse.prerequisites.map((prereq, idx) => {
                      const prereqCourse = courses.find((c) => c.id === prereq.prerequisite_id);
                      if (!prereqCourse) return null;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleCourseClick(prereqCourse.code)}
                          className="w-full text-left px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 hover:border-indigo-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                        >
                          <div className="font-bold text-sm text-indigo-900">{prereqCourse.code}</div>
                          <div className="text-xs text-indigo-700 mt-1 line-clamp-1 font-medium">{prereqCourse.title}</div>
                          {(prereq.is_corequisite || prereq.is_exclusion) && (
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
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

