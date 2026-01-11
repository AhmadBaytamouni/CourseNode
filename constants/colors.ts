/**
 * Color constants for course levels and UI elements
 */

export const COURSE_LEVEL_COLORS = {
  1000: '#16a34a', // green-600
  2000: '#ca8a04', // yellow-600
  3000: '#ea580c', // orange-600
  4000: '#dc2626', // red-600
} as const;

export const UI_COLORS = {
  // Background
  BACKGROUND: '#12121f',
  
  // Selection states
  SELECTED: {
    BORDER: '#60a5fa',
    BG_START: 'rgba(96, 165, 250, 0.25)',
    BG_MID: 'rgba(139, 92, 246, 0.25)',
    BG_END: 'rgba(139, 92, 246, 0.25)',
    TEXT: '#bfdbfe',
    RING: 'rgba(96, 165, 250, 0.4)',
  },
  
  // Prerequisite states
  PREREQUISITE: {
    BORDER: '#a78bfa',
    BG_START: 'rgba(167, 139, 250, 0.2)',
    BG_END: 'rgba(139, 92, 246, 0.2)',
    TEXT: '#e9d5ff',
    RING: 'rgba(167, 139, 250, 0.3)',
  },
  
  // Unlockable states
  UNLOCKABLE: {
    BORDER: '#10b981',
    BG_START: 'rgba(16, 185, 129, 0.15)',
    BG_END: 'rgba(20, 184, 166, 0.15)',
    TEXT: '#6ee7b7',
    RING: 'rgba(16, 185, 129, 0.2)',
  },
  
  // Edge colors
  EDGE: {
    DEFAULT: '#60a5fa',
    PREREQUISITE: '#6366f1',
    UNLOCKABLE: '#10b981',
    COREREQUISITE: '#f59e0b',
    COREREQUISITE_HIGHLIGHT: '#fb923c',
  },
  
  // Gradient
  GRADIENT: {
    START: '#60a5fa', // blue-400
    END: '#a78bfa',   // purple-400
  },
} as const;

/**
 * Get the color for a course level
 */
export function getCourseLevelColor(level: number): string {
  if (level >= 4000) return COURSE_LEVEL_COLORS[4000];
  if (level >= 3000) return COURSE_LEVEL_COLORS[3000];
  if (level >= 2000) return COURSE_LEVEL_COLORS[2000];
  return COURSE_LEVEL_COLORS[1000];
}
