export interface Course {
  id: string;
  code: string;              // e.g., "COMP 1001"
  title: string;
  credits: number;
  description: string;
  prerequisites: Prerequisite[];
  corequisites?: string[];
  exclusions?: string[];
  level: number;             // 1000, 2000, 3000, 4000
  department: string;        // "COMP" for now
}

export interface Prerequisite {
  id?: string;
  course_id: string;
  prerequisite_id: string;
  is_corequisite: boolean;
  is_exclusion: boolean;
  logic_type?: 'AND' | 'OR' | 'ONE_OF' | 'ALL_OF';
}

// Database types (from Supabase)
export interface DatabaseCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  description: string | null;
  level: number;
  department: string;
  created_at: string;
  updated_at: string;
}

export interface DatabasePrerequisite {
  id: string;
  course_id: string;
  prerequisite_id: string;
  is_corequisite: boolean;
  is_exclusion: boolean;
  logic_type: string | null;
  created_at: string;
}

// React Flow types
export interface CourseNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    course: Course;
    isSelected?: boolean;
    isPrerequisite?: boolean;
    isUnlockable?: boolean;
    isFaded?: boolean;
  };
}

export interface CourseEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}

