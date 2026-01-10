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

// Get year level (1-4) from course level (1000-4000)
function getYearLevel(level: number): number {
  if (level >= 4000) return 4;
  if (level >= 3000) return 3;
  if (level >= 2000) return 2;
  return 1;
}

// Build a map of course dependencies (reverse prerequisites)
function buildDependencyMap(courses: Course[]): Map<string, Set<string>> {
  const dependencyMap = new Map<string, Set<string>>();
  
  courses.forEach((course) => {
    if (!dependencyMap.has(course.id)) {
      dependencyMap.set(course.id, new Set());
    }
    
    course.prerequisites.forEach((prereq) => {
      if (!prereq.is_exclusion) {
        if (!dependencyMap.has(prereq.prerequisite_id)) {
          dependencyMap.set(prereq.prerequisite_id, new Set());
        }
        dependencyMap.get(prereq.prerequisite_id)!.add(course.id);
      }
    });
  });
  
  return dependencyMap;
}

// Calculate tree layout positions (horizontal layout: years as rows, courses as columns)
export function buildCourseNodes(
  courses: Course[],
  selectedCourseIds: Set<string>,
  prerequisiteIds: Set<string>,
  unlockableIds: Set<string> = new Set(),
  shouldFade: (courseId: string) => boolean = () => false
): CourseNode[] {
  const nodeWidth = 300;
  const nodeHeight = 200;
  const horizontalSpacing = 320; // Space between courses in same year (horizontal)
  const verticalSpacing = 250; // Space between year rows (vertical)
  const yearStartX = 100; // Starting X position
  const yearStartY = 150; // Starting Y position

  // Group courses by year level
  const coursesByYear = new Map<number, Course[]>();
  courses.forEach((course) => {
    const year = getYearLevel(course.level);
    if (!coursesByYear.has(year)) {
      coursesByYear.set(year, []);
    }
    coursesByYear.get(year)!.push(course);
  });

  // Sort years
  const years = Array.from(coursesByYear.keys()).sort();
  
  // Build dependency map (what courses depend on this course)
  const dependencyMap = buildDependencyMap(courses);
  
  // Track positions to avoid overlaps
  const positions = new Map<string, { x: number; y: number }>();
  
  // Position courses year by year (top to bottom: first year to fourth year)
  years.forEach((year) => {
    const yearCourses = coursesByYear.get(year)!;
    const y = yearStartY + (year - 1) * verticalSpacing;
    
    // Sort courses within year to try to group related courses together
    // Sort by department first, then by code
    yearCourses.sort((a, b) => {
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      return a.code.localeCompare(b.code);
    });
    
    // Position courses horizontally within this year
    // Sort courses: those with prerequisites in previous year first, then by department/code
    yearCourses.sort((a, b) => {
      // Courses with prerequisites from previous year should be prioritized
      const aHasPrevYearPrereq = a.prerequisites.some(prereq => {
        if (prereq.is_exclusion) return false;
        const prereqYear = getYearLevel(
          courses.find((c) => c.id === prereq.prerequisite_id)?.level || 1000
        );
        return prereqYear < year;
      });
      const bHasPrevYearPrereq = b.prerequisites.some(prereq => {
        if (prereq.is_exclusion) return false;
        const prereqYear = getYearLevel(
          courses.find((c) => c.id === prereq.prerequisite_id)?.level || 1000
        );
        return prereqYear < year;
      });
      
      if (aHasPrevYearPrereq && !bHasPrevYearPrereq) return -1;
      if (!aHasPrevYearPrereq && bHasPrevYearPrereq) return 1;
      
      // Then sort by department and code
      if (a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      return a.code.localeCompare(b.code);
    });
    
    // Track X positions used in this year
    const usedXPositions = new Set<number>();
    let currentX = yearStartX;
    
    yearCourses.forEach((course) => {
      // Check if any prerequisite courses from previous year have been positioned
      let preferredX: number | null = null;
      
      if (course.prerequisites.length > 0) {
        const prevYearPrereqs = course.prerequisites
          .filter(prereq => {
            if (prereq.is_exclusion) return false;
            const prereqYear = getYearLevel(
              courses.find((c) => c.id === prereq.prerequisite_id)?.level || 1000
            );
            return prereqYear < year && positions.has(prereq.prerequisite_id);
          })
          .map(prereq => positions.get(prereq.prerequisite_id)!);
        
        if (prevYearPrereqs.length > 0) {
          // Use average X of prerequisites to align
          preferredX = prevYearPrereqs.reduce((sum, pos) => sum + pos.x, 0) / prevYearPrereqs.length;
        }
      }
      
      // Find a good X position
      let finalX = currentX;
      
      if (preferredX !== null) {
        // Try to use preferred X, or find nearest available spot
        finalX = preferredX;
        let offset = 0;
        let direction = 1;
        
        while (usedXPositions.has(Math.round(finalX / horizontalSpacing) * horizontalSpacing)) {
          finalX = preferredX + offset * direction * (horizontalSpacing * 0.5);
          direction *= -1;
          if (direction > 0) offset++;
          if (offset > 50) break; // Safety limit
        }
        
        // Snap to grid
        finalX = Math.round(finalX / (horizontalSpacing * 0.5)) * (horizontalSpacing * 0.5);
      }
      
      // Ensure minimum spacing from other courses
      const snappedX = Math.round(finalX / (horizontalSpacing * 0.5)) * (horizontalSpacing * 0.5);
      let adjustedX = snappedX;
      let attempts = 0;
      
      while (usedXPositions.has(Math.round(adjustedX)) && attempts < 100) {
        adjustedX = currentX;
        currentX += horizontalSpacing;
        attempts++;
      }
      
      if (attempts >= 100) {
        adjustedX = currentX;
      }
      
      usedXPositions.add(Math.round(adjustedX));
      positions.set(course.id, { x: adjustedX, y });
      currentX = Math.max(currentX, adjustedX + horizontalSpacing);
    });
  });

  // Build nodes with calculated positions
  return courses.map((course) => {
    const pos = positions.get(course.id) || { x: 0, y: 0 };
    
    return {
      id: course.id,
      type: 'courseNode',
      position: {
        x: pos.x,
        y: pos.y,
      },
      data: {
        course,
        isSelected: selectedCourseIds.has(course.id),
        isPrerequisite: prerequisiteIds.has(course.id),
        isUnlockable: unlockableIds.has(course.id),
        isFaded: shouldFade(course.id),
      },
      draggable: false,
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
        
        let strokeColor = prereq.is_corequisite ? '#f59e0b' : '#60a5fa';
        let strokeWidth = 2;
        let opacity = 0.5;
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
          type: 'default', // Use default edges for cleaner tree structure
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

