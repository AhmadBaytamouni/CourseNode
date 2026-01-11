/**
 * Scroll utility functions
 */

/**
 * Scroll to a year section with proper offset for sticky header
 */
export function scrollToYear(level: number, headerOffset: number = 170): void {
  const element = document.getElementById(`year-${level}`);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}
