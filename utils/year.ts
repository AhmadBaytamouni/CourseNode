/**
 * Year level utility functions
 */

/**
 * Get year level (1-4) from course level (1000-4000)
 */
export function getYearLevel(level: number): number {
  if (level >= 4000) return 4;
  if (level >= 3000) return 3;
  if (level >= 2000) return 2;
  return 1;
}

/**
 * Get year label from year number
 */
export function getYearLabel(year: number): string {
  switch (year) {
    case 1:
      return 'First Year';
    case 2:
      return 'Second Year';
    case 3:
      return 'Third Year';
    case 4:
      return 'Fourth Year';
    default:
      return '';
  }
}
