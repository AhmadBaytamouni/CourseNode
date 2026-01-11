import { useMemo, useState, useEffect } from 'react';
import { Course, CourseNode, CourseEdge } from '@/lib/types';
import { buildCourseNodes, buildCourseEdges } from '@/lib/graph';

/**
 * Custom hook for managing course graph nodes and edges
 * Builds and maintains the graph structure based on course selection state
 */
export function useCourseGraph(
  courses: Course[],
  selectedCourseId: string | null,
  prerequisiteIds: Set<string>,
  unlockableIds: Set<string> = new Set(),
  shouldFade: (courseId: string) => boolean = () => false
) {
  // Convert sets to strings for stable memoization comparison
  const prerequisiteIdsStr = useMemo(() => Array.from(prerequisiteIds).sort().join(','), [prerequisiteIds]);
  const unlockableIdsStr = useMemo(() => Array.from(unlockableIds).sort().join(','), [unlockableIds]);

  /**
   * Build course nodes with calculated positions and styling based on selection state
   */
  const computedNodes = useMemo<CourseNode[]>(() => {
    const selectedSet = selectedCourseId ? new Set([selectedCourseId]) : new Set<string>();
    return buildCourseNodes(courses, selectedSet, prerequisiteIds, unlockableIds, shouldFade);
  }, [courses, selectedCourseId, prerequisiteIdsStr, unlockableIdsStr, shouldFade]);

  /**
   * Build course edges (prerequisite connections) with styling based on selection state
   */
  const computedEdges = useMemo<CourseEdge[]>(() => {
    const selectedSet = selectedCourseId ? new Set([selectedCourseId]) : new Set<string>();
    return buildCourseEdges(courses, selectedSet, prerequisiteIds, unlockableIds);
  }, [courses, selectedCourseId, prerequisiteIdsStr, unlockableIdsStr]);

  // State for nodes - always use computed positions since nodes are not draggable
  const [nodes, setNodes] = useState<CourseNode[]>(computedNodes);

  // Update nodes when computed nodes change
  // For tree layout, always use computed positions (nodes are not draggable)
  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes]);

  return {
    nodes,
    edges: computedEdges,
  };
}
