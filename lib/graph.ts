import { Course, CourseNode, CourseEdge } from './types';
import { getCourseLevelColor } from './courseData';

// Calculate which courses are unlockable based on selected courses
export function calculateUnlockableCourses(
  courses: Course[],
  selectedCourseIds: Set<string>
): Set<string> {
  const unlockable = new Set<string>();

  courses.forEach((course) => {
    if (selectedCourseIds.has(course.id)) {
      return; // Already selected
    }

    // Check if all prerequisites are met
    const canUnlock = course.prerequisites.every((prereq) => {
      if (prereq.is_exclusion) {
        return !selectedCourseIds.has(prereq.prerequisite_id);
      }
      return selectedCourseIds.has(prereq.prerequisite_id);
    });

    if (canUnlock && course.prerequisites.length > 0) {
      unlockable.add(course.id);
    }
  });

  return unlockable;
}

// Build graph nodes from courses
export function buildCourseNodes(
  courses: Course[],
  selectedCourseIds: Set<string>,
  prerequisiteIds: Set<string>,
  unlockableIds: Set<string> = new Set(),
  shouldFade: (courseId: string) => boolean = () => false
): CourseNode[] {
  // Simple grid layout for now (can be improved with force-directed layout)
  const cols = Math.ceil(Math.sqrt(courses.length));
  const nodeWidth = 200;
  const nodeHeight = 100;
  const spacing = 50;

  return courses.map((course, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    return {
      id: course.id,
      type: 'courseNode',
      position: {
        x: col * (nodeWidth + spacing),
        y: row * (nodeHeight + spacing),
      },
      data: {
        course,
        isSelected: selectedCourseIds.has(course.id),
        isPrerequisite: prerequisiteIds.has(course.id),
        isUnlockable: unlockableIds.has(course.id),
        isFaded: shouldFade(course.id),
      },
    };
  });
}

// Build graph edges from prerequisites
export function buildCourseEdges(
  courses: Course[],
  selectedCourseIds: Set<string> = new Set(),
  prerequisiteIds: Set<string> = new Set(),
  unlockableIds: Set<string> = new Set()
): CourseEdge[] {
  const edges: CourseEdge[] = [];

  courses.forEach((course) => {
    course.prerequisites.forEach((prereq) => {
      if (!prereq.is_exclusion) {
        const isPrerequisiteEdge = prerequisiteIds.has(prereq.prerequisite_id) && 
                                   selectedCourseIds.has(course.id);
        const isSelectedCourseEdge = selectedCourseIds.has(course.id) || 
                                     selectedCourseIds.has(prereq.prerequisite_id);
        
        let strokeColor = prereq.is_corequisite ? '#f59e0b' : '#94a3b8';
        let strokeWidth = 1.5;
        let opacity = 0.6;
        let animated = false;

        const isUnlockableEdge = selectedCourseIds.has(prereq.prerequisite_id) && unlockableIds.has(course.id);

        if (isPrerequisiteEdge) {
          // Highlight prerequisite edges for selected course
          strokeColor = prereq.is_corequisite ? '#fb923c' : '#6366f1';
          strokeWidth = 3;
          opacity = 0.9;
          animated = true;
        } else if (isUnlockableEdge) {
          // Highlight unlockable edges (courses that become available)
          strokeColor = prereq.is_corequisite ? '#f59e0b' : '#10b981';
          strokeWidth = 3;
          opacity = 0.9;
          animated = true;
        } else if (isSelectedCourseEdge) {
          // Highlight edges connected to selected course
          strokeColor = prereq.is_corequisite ? '#f59e0b' : '#818cf8';
          strokeWidth = 2;
          opacity = 0.8;
        }

        edges.push({
          id: `edge-${prereq.prerequisite_id}-${course.id}`,
          source: prereq.prerequisite_id,
          target: course.id,
          type: 'smoothstep',
          animated,
          style: {
            stroke: strokeColor,
            strokeWidth,
            opacity,
          },
        });
      }
    });
  });

  return edges;
}

// Find all courses that require a given course
export function findDependentCourses(courses: Course[], courseId: string): Course[] {
  return courses.filter((course) =>
    course.prerequisites.some((prereq) => prereq.prerequisite_id === courseId)
  );
}

// Check for cycles in prerequisite graph
export function hasCycle(courses: Course[]): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(courseId: string): boolean {
    if (recStack.has(courseId)) {
      return true; // Cycle detected
    }
    if (visited.has(courseId)) {
      return false;
    }

    visited.add(courseId);
    recStack.add(courseId);

    const course = courses.find((c) => c.id === courseId);
    if (course) {
      for (const prereq of course.prerequisites) {
        if (dfs(prereq.prerequisite_id)) {
          return true;
        }
      }
    }

    recStack.delete(courseId);
    return false;
  }

  for (const course of courses) {
    if (!visited.has(course.id)) {
      if (dfs(course.id)) {
        return true;
      }
    }
  }

  return false;
}

