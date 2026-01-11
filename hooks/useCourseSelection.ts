import { useState, useCallback } from 'react';
import { Course } from '@/lib/types';
import { calculateUnlockableCourses, findDependentCourses } from '@/lib/graph';

/**
 * Custom hook for managing course selection state
 * Handles selected course, prerequisites, and unlockable courses
 */
export function useCourseSelection(courses: Course[]) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [prerequisiteIds, setPrerequisiteIds] = useState<Set<string>>(new Set());
  const [unlockableIds, setUnlockableIds] = useState<Set<string>>(new Set());

  /**
   * Select a course and highlight its prerequisites and unlockable courses
   * Toggles selection if the course is already selected
   */
  const selectCourseWithPrerequisites = useCallback((courseId: string) => {
    // Toggle: if already selected, clear selection
    if (selectedCourseId === courseId) {
      setSelectedCourseId(null);
      setPrerequisiteIds(new Set());
      setUnlockableIds(new Set());
      return;
    }

    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    setSelectedCourseId(courseId);
    
    // Collect all prerequisite IDs (direct prerequisites)
    // Note: We highlight ALL prerequisites regardless of AND/OR logic:
    // - For AND: All are required, so highlighting all is correct
    // - For OR: Multiple options available, so highlighting all shows choices
    const prereqIds = new Set<string>();
    course.prerequisites.forEach(prereq => {
      if (!prereq.is_exclusion) {
        prereqIds.add(prereq.prerequisite_id);
      }
    });
    
    setPrerequisiteIds(prereqIds);
    
    // Calculate which courses become unlockable when this course is selected
    // (courses that have this course as a prerequisite)
    const unlockable = findDependentCourses(courses, courseId).map(c => c.id);
    setUnlockableIds(new Set(unlockable));
  }, [courses, selectedCourseId]);

  /**
   * Clear all selection state
   */
  const clearSelection = useCallback(() => {
    setSelectedCourseId(null);
    setPrerequisiteIds(new Set());
    setUnlockableIds(new Set());
  }, []);

  /**
   * Check if a course is currently selected
   */
  const isSelected = useCallback((courseId: string) => {
    return selectedCourseId === courseId;
  }, [selectedCourseId]);

  /**
   * Check if a course is a prerequisite of the selected course
   */
  const isPrerequisite = useCallback((courseId: string) => {
    return prerequisiteIds.has(courseId);
  }, [prerequisiteIds]);

  /**
   * Check if a course is unlockable (can be taken after selected course)
   */
  const isUnlockable = useCallback((courseId: string) => {
    return unlockableIds.has(courseId);
  }, [unlockableIds]);

  /**
   * Check if a course should be faded (not selected, not prerequisite, not unlockable)
   */
  const shouldFade = useCallback((courseId: string) => {
    if (!selectedCourseId) return false;
    return courseId !== selectedCourseId && 
           !prerequisiteIds.has(courseId) && 
           !unlockableIds.has(courseId);
  }, [selectedCourseId, prerequisiteIds, unlockableIds]);

  return {
    selectedCourseId,
    prerequisiteIds,
    unlockableIds,
    selectCourseWithPrerequisites,
    clearSelection,
    isSelected,
    isPrerequisite,
    isUnlockable,
    shouldFade,
  };
}
