/**
 * Text utility functions for cleaning and formatting
 */

/**
 * Clean description text by fixing encoding issues and formatting
 */
export function cleanDescription(description: string, code: string): string {
  if (!description) return '';

  let cleaned = description.trim();

  // Fix encoding issues (non-breaking spaces showing as A followed by special char)
  cleaned = cleaned.replace(/A[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');
  cleaned = cleaned.replace(/[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');

  // Clean up multiple spaces/tabs on the same line, but keep newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' ');

  // Add newlines before common section markers
  const sectionMarkers = [
    'Also listed as',
    'Precludes',
    'Prerequisite(s):',
    'Lectures',
    'Lecture',
  ];

  sectionMarkers.forEach((marker) => {
    const regex = new RegExp(`([^\\n])(${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    cleaned = cleaned.replace(regex, '$1\n$2');
  });

  // Clean up excessive newlines (more than 2 consecutive -> 2 newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove trailing spaces from each line
  cleaned = cleaned.split('\n').map((line) => line.trimEnd()).join('\n');

  return cleaned.trim();
}

/**
 * Clean title text by fixing encoding issues
 */
export function cleanTitle(title: string): string {
  if (!title) return '';

  let cleaned = title.trim();

  // Fix encoding issues - replace non-breaking spaces and similar
  cleaned = cleaned.replace(/[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  return cleaned.trim();
}

/**
 * Check if a course is no longer offered based on title and description
 */
export function isNoLongerOffered(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();

  // Check if the title itself indicates it's no longer offered
  if (title.toLowerCase().includes('(no longer offered)')) {
    return true;
  }

  // Check for patterns that indicate THIS course is no longer offered
  const noLongerOfferedPatterns = [
    /^(this course|course|it).*no longer offered/i,
    /^.*is\s+no\s+longer\s+offered\.?$/i,
    /^.*not\s+offered\s+(anymore|any\s+longer)/i,
  ];

  // Check if the description starts with a "no longer offered" statement
  const descStart = description.trim().substring(0, 200).toLowerCase();
  for (const pattern of noLongerOfferedPatterns) {
    if (pattern.test(descStart)) {
      return true;
    }
  }

  return false;
}
