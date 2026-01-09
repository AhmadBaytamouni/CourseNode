import { useMemo, useCallback, useState, useEffect } from 'react';
import { NodeChange, applyNodeChanges } from '@xyflow/react';
import { Course, CourseNode, CourseEdge } from '@/lib/types';
import { buildCourseNodes, buildCourseEdges } from '@/lib/graph';

export function useCourseGraph(
  courses: Course[],
  selectedCourseId: string | null,
  prerequisiteIds: Set<string>,
  unlockableIds: Set<string> = new Set(),
  shouldFade: (courseId: string) => boolean = () => false
) {
  // Convert sets to strings for stable comparison
  const prerequisiteIdsStr = useMemo(() => Array.from(prerequisiteIds).sort().join(','), [prerequisiteIds]);
  const unlockableIdsStr = useMemo(() => Array.from(unlockableIds).sort().join(','), [unlockableIds]);

  // Build computed nodes and edges
  const computedNodes = useMemo<CourseNode[]>(() => {
    // Create sets for compatibility with buildCourseNodes
    const selectedSet = selectedCourseId ? new Set([selectedCourseId]) : new Set();
    return buildCourseNodes(courses, selectedSet, prerequisiteIds, unlockableIds, shouldFade);
  }, [courses, selectedCourseId, prerequisiteIdsStr, unlockableIdsStr, shouldFade]);

  const computedEdges = useMemo<CourseEdge[]>(() => {
    const selectedSet = selectedCourseId ? new Set([selectedCourseId]) : new Set();
    return buildCourseEdges(courses, selectedSet, prerequisiteIds, unlockableIds);
  }, [courses, selectedCourseId, prerequisiteIdsStr, unlockableIdsStr]);

  // State for nodes - always use computed positions since nodes are not draggable
  const [nodes, setNodes] = useState<CourseNode[]>(computedNodes);

  // Update nodes when computed nodes change
  // For tree layout, always use computed positions (nodes are not draggable)
  useEffect(() => {
    setNodes(computedNodes);
  }, [computedNodes]);

  // Handle node changes from React Flow (e.g., dragging)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
  }, []);

  return {
    nodes,
    edges: computedEdges,
    onNodesChange,
  };
}

