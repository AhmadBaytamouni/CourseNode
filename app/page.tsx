'use client';

import { useState, useEffect, useMemo } from 'react';
import { Course } from '@/lib/types';
import { getAllCourses, getCourseByCode, formatCredits } from '@/lib/courseData';
import { useCourseSelection } from '@/hooks/useCourseSelection';
import { useCourseGraph } from '@/hooks/useCourseGraph';
import CourseGraph from '@/components/CourseGraph';
import CourseDetails from '@/components/CourseDetails';
import CourseSelector from '@/components/CourseSelector';
import { LAYOUT } from '@/constants/dimensions';
import { UI_COLORS } from '@/constants/colors';

/**
 * Main application page
 * Manages course data, selection state, and search filtering
 * Renders the course graph and details panel
 */
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

  const { nodes, edges } = useCourseGraph(
    courses,
    selectedCourseId,
    prerequisiteIds,
    unlockableIds,
    shouldFade
  );

  /**
   * Filter courses based on search query (matches code or title)
   */
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(query) ||
        c.title.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  /**
   * Filter nodes to only show courses matching the search query
   */
  const filteredNodes = useMemo(() => {
    if (!searchQuery) return nodes;
    const filteredIds = new Set(filteredCourses.map((c) => c.id));
    return nodes.filter((n) => filteredIds.has(n.id));
  }, [nodes, filteredCourses, searchQuery]);

  /**
   * Filter edges to only show connections between visible courses
   */
  const filteredEdges = useMemo(() => {
    if (!searchQuery) return edges;
    const filteredIds = new Set(filteredCourses.map((c) => c.id));
    return edges.filter(
      (e) => filteredIds.has(e.source) && filteredIds.has(e.target)
    );
  }, [edges, filteredCourses, searchQuery]);

  /**
   * Load courses from the database on component mount
   */
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

  /**
   * Handle clicking on a course node in the graph
   */
  const handleNodeClick = (nodeId: string) => {
    const course = courses.find((c) => c.id === nodeId);
    if (!course) return;

    const wasSelected = selectedCourseId === nodeId;
    selectCourseWithPrerequisites(nodeId);
    setSelectedCourse(wasSelected ? null : course);
  };

  /**
   * Handle clicking on a course in the details panel
   */
  const handleCourseClick = (courseCode: string) => {
    const course = getCourseByCode(courses, courseCode);
    if (!course) return;

    const wasSelected = selectedCourseId === course.id;
    selectCourseWithPrerequisites(course.id);
    setSelectedCourse(wasSelected ? null : course);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div>
            <p className="text-gray-200 font-semibold text-lg">Loading courses...</p>
            <p className="text-sm text-gray-400 mt-1">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4 max-w-md mx-4">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-red-400 font-bold text-xl mb-2">Error Loading Courses</p>
            <p className="text-gray-300 mb-4">{error}</p>
            <p className="text-sm text-gray-400 glass rounded-lg p-4 border border-red-500/30">
              Please check your Supabase configuration and ensure the database is set up correctly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col overflow-y-auto overflow-x-hidden" 
      style={{ background: UI_COLORS.BACKGROUND }}
    >
      <div className="fixed top-0 left-0 right-0 z-30 flex-shrink-0">
        <CourseSelector
          courses={courses}
          onClearSelection={() => {
            clearSelection();
            setSelectedCourse(null);
          }}
          onSearch={setSearchQuery}
        />
      </div>

      <div 
        className="flex-1 flex relative min-h-screen" 
        style={{ paddingTop: `${LAYOUT.HEADER_HEIGHT}px` }}
      >
        <div 
          className="flex-1 relative min-w-0" 
          style={{ marginRight: `${LAYOUT.COURSE_DETAILS_WIDTH}px` }}
        >
          <CourseGraph
            nodes={filteredNodes}
            edges={filteredEdges}
            onNodeClick={handleNodeClick}
          />
        </div>

        <div 
          className="hidden lg:block flex-shrink-0 fixed z-20" 
          style={{ 
            top: `${LAYOUT.COURSE_DETAILS_TOP}px`, 
            height: `calc(100vh - ${LAYOUT.COURSE_DETAILS_TOP}px)`, 
            width: `${LAYOUT.COURSE_DETAILS_WIDTH}px`, 
            right: '0' 
          }}
        >
          <CourseDetails
            course={selectedCourse}
            allCourses={courses}
            onClose={() => setSelectedCourse(null)}
            onCourseClick={handleCourseClick}
          />
        </div>
      </div>

      {/* Mobile course details modal */}
      {selectedCourse && (
        <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end animate-fade-in">
          <div className="glass-strong w-full max-h-[85vh] rounded-t-3xl shadow-2xl overflow-hidden border-t border-white/20">
            <div className="sticky top-0 glass-strong border-b border-white/10 px-6 py-5 flex justify-between items-start shadow-md">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{selectedCourse.code}</h2>
                <p className="text-sm font-semibold text-gray-300 px-3 py-1.5 glass rounded-lg inline-block border border-white/10">
                  {formatCredits(selectedCourse.credits)} • {selectedCourse.level}-level
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 border border-white/10 hover:border-white/20"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
              <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
                <h3 className="text-lg font-bold text-gray-100">{selectedCourse.title}</h3>
              </div>
              {selectedCourse.description && (
                <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                    Description
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedCourse.description}</p>
                </div>
              )}
              {selectedCourse.prerequisites.length > 0 && (
                <div className="glass rounded-xl p-4 border border-white/10 shadow-lg">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
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
                          className="w-full text-left px-4 py-3 glass hover:bg-white/10 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/20 transform hover:scale-[1.02]"
                        >
                          <div className="font-bold text-sm text-blue-300">{prereqCourse.code}</div>
                          <div className="text-xs text-gray-400 mt-1 line-clamp-1 font-medium">{prereqCourse.title}</div>
                          {(prereq.is_corequisite || prereq.is_exclusion) && (
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
