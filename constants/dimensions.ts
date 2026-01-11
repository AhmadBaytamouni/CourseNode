/**
 * Dimension constants for layout and UI elements
 */

export const LAYOUT = {
  HEADER_HEIGHT: 170,
  HEADER_OFFSET: 150,
  COURSE_DETAILS_WIDTH: 450,
  COURSE_DETAILS_TOP: 150,
} as const;

export const COURSE_NODE = {
  WIDTH: 315,
  MIN_HEIGHT: 195,
  HORIZONTAL_SPACING: 300,
  VERTICAL_SPACING: 250,
  START_X: 100,
  START_Y: 150,
} as const;

export const BADGES = {
  WIDTH: 125,
  HEIGHT_LARGE: 48,
  HEIGHT_SMALL: 36,
  GAP: 15,
} as const;

export const SEARCH_BAR = {
  WIDTH: 585,
  HEIGHT: 48,
} as const;

export const CLEAR_BUTTON = {
  WIDTH: 125,
  HEIGHT: 48,
} as const;

export const EDGE_STYLES = {
  DEFAULT: {
    STROKE_WIDTH: 2,
    OPACITY: 0.15,
    ANIMATED: false,
  },
  HIGHLIGHTED: {
    STROKE_WIDTH: 4,
    OPACITY: 1.0,
    ANIMATED: true,
  },
  SELECTED: {
    STROKE_WIDTH: 3,
    OPACITY: 0.9,
    ANIMATED: false,
  },
} as const;
