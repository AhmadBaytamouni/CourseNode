import { Course, DatabaseCourse, DatabasePrerequisite, Prerequisite } from './types';
import { fetchCourses, fetchPrerequisites } from './supabase';
import { cleanDescription, cleanTitle, isNoLongerOffered } from '@/utils/text';
import { getCourseLevelColor } from '@/constants/colors';

/**
 * Transform database courses to application course objects
 * Filters out inactive courses and maps prerequisites
 */
export function transformCourses(
  dbCourses: DatabaseCourse[],
  dbPrerequisites: DatabasePrerequisite[]
): Course[] {
  const courseMap = new Map<string, Course>();

  // Filter out courses that are no longer offered and 5000-level courses (graduate level)
  const activeCourses = dbCourses.filter((dbCourse) => {
    // Exclude 5000-level courses (graduate level, not undergraduate)
    if (dbCourse.level >= 5000) {
      return false;
    }
    // Exclude courses that are no longer offered
    return !isNoLongerOffered(dbCourse.title, dbCourse.description || '');
  });

  // Create course objects
  activeCourses.forEach((dbCourse) => {
    const rawDescription = dbCourse.description || '';
    const cleanedDesc = cleanDescription(rawDescription, dbCourse.code);
    
    // Use cleaned description, or fall back to raw if parsing failed
    let finalDescription = cleanedDesc;
    
    // If cleaned is too short but raw exists, try using raw with minimal cleanup
    if (!cleanedDesc || (cleanedDesc.length < 50 && rawDescription.length > 100)) {
      // Description might be in a different format - try minimal cleanup
      finalDescription = rawDescription
        .replace(/\n\n\s*(Includes:|Also listed as|Precludes|Prerequisite\(s\):|Lectures)[\s\S]*$/i, '')
        .replace(/\n\s*COMP\s*\d{4}\s*\[.*$/i, '')
        .trim();
      
      // Debug: Log when using fallback
      if (finalDescription && finalDescription.length > cleanedDesc.length) {
        console.log(`Course ${dbCourse.code}: Using fallback description extraction. Original length: ${rawDescription.length}, Cleaned: ${cleanedDesc.length}, Fallback: ${finalDescription.length}`);
      }
    }
    
    courseMap.set(dbCourse.id, {
      id: dbCourse.id,
      code: dbCourse.code,
      title: cleanTitle(dbCourse.title),
      credits: dbCourse.credits,
      description: finalDescription || cleanedDesc || rawDescription.trim(),
      prerequisites: [],
      level: dbCourse.level,
      department: dbCourse.department,
    });
  });

  // Add prerequisites (only for active courses)
  dbPrerequisites.forEach((dbPrereq) => {
    const course = courseMap.get(dbPrereq.course_id);
    const prereqCourse = courseMap.get(dbPrereq.prerequisite_id);
    
    // Only add prerequisite if both courses exist (are active)
    if (course && prereqCourse) {
      course.prerequisites.push({
        id: dbPrereq.id,
        course_id: dbPrereq.course_id,
        prerequisite_id: dbPrereq.prerequisite_id,
        is_corequisite: dbPrereq.is_corequisite,
        is_exclusion: dbPrereq.is_exclusion,
        logic_type: dbPrereq.logic_type as Prerequisite['logic_type'] || undefined,
      });
    }
  });

  return Array.from(courseMap.values());
}

/**
 * Fetch and transform all course data from the database
 */
export async function getAllCourses(): Promise<Course[]> {
  const [dbCourses, dbPrerequisites] = await Promise.all([
    fetchCourses(),
    fetchPrerequisites(),
  ]);

  return transformCourses(dbCourses, dbPrerequisites);
}

/**
 * Get a course by its code (e.g., "COMP 1001")
 */
export function getCourseByCode(courses: Course[], code: string): Course | undefined {
  return courses.find((c) => c.code === code);
}

// Re-export getCourseLevelColor from constants for backward compatibility
export { getCourseLevelColor };

/**
 * Format credits display text with proper singular/plural handling
 * Examples: "0.5 credit", "1 credit", "1.5 credits", "2 credits"
 */
export function formatCredits(credits: number): string {
  const isPlural = credits > 1;
  // Format to remove trailing zeros (0.5 instead of 0.50, 1 instead of 1.0)
  const formattedCredits = credits % 1 === 0 
    ? credits.toString() 
    : credits.toFixed(2).replace(/\.?0+$/, '');
  return `${formattedCredits} credit${isPlural ? 's' : ''}`;
}
