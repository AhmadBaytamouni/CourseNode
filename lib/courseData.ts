import { Course, DatabaseCourse, DatabasePrerequisite, Prerequisite } from './types';
import { fetchCourses, fetchPrerequisites } from './supabase';

// Helper function to check if a course is no longer offered
function isNoLongerOffered(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  return text.includes('no longer offered') || 
         text.includes('(no longer offered)') ||
         text.includes('not offered anymore') ||
         title.toLowerCase().includes('(no longer offered)');
}

// Helper function to clean description text
// The database now has proper descriptions that start with the course title
// We preserve newlines to maintain formatting like the Carleton website
function cleanDescription(description: string, code: string): string {
  if (!description) return '';
  
  let cleaned = description.trim();
  
  // Fix encoding issues (non-breaking spaces showing as A followed by special char)
  // These appear as "COMPA 1405" instead of "COMP 1405"
  cleaned = cleaned.replace(/A[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');
  cleaned = cleaned.replace(/[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');
  
  // Clean up multiple spaces (but preserve newlines)
  // Replace multiple spaces/tabs on the same line, but keep newlines
  cleaned = cleaned.replace(/[ \t]+/g, ' '); // Multiple spaces/tabs -> single space
  
  // Add newlines before common section markers that should be on separate lines
  // These markers typically appear without proper spacing in the scraped data
  const sectionMarkers = [
    'Also listed as',
    'Precludes',
    'Prerequisite(s):',
    'Lectures',
    'Lecture',
  ];
  
  sectionMarkers.forEach(marker => {
    // Add newline before marker if it's not already preceded by a newline
    // Use a regex that looks for the marker at word boundaries
    const regex = new RegExp(`([^\\n])(${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    cleaned = cleaned.replace(regex, '$1\n$2');
  });
  
  // Clean up excessive newlines (more than 2 consecutive newlines -> 2 newlines)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Remove trailing spaces from each line
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');
  
  return cleaned.trim();
}

// Helper function to clean title text (fix encoding issues)
function cleanTitle(title: string): string {
  if (!title) return '';
  
  let cleaned = title.trim();
  
  // Fix encoding issues - replace non-breaking spaces and similar
  cleaned = cleaned.replace(/[\u00A0\u00AD\u2000-\u200F\u2028\u2029\uFEFF]/g, ' ');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned.trim();
}

// Transform database courses to app courses
export function transformCourses(
  dbCourses: DatabaseCourse[],
  dbPrerequisites: DatabasePrerequisite[]
): Course[] {
  const courseMap = new Map<string, Course>();

  // Filter out courses that are no longer offered
  const activeCourses = dbCourses.filter((dbCourse) => {
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
      title: cleanTitle(dbCourse.title), // Safety measure for any remaining encoding issues
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

// Fetch and transform all course data
export async function getAllCourses(): Promise<Course[]> {
  const [dbCourses, dbPrerequisites] = await Promise.all([
    fetchCourses(),
    fetchPrerequisites(),
  ]);

  return transformCourses(dbCourses, dbPrerequisites);
}

// Get course by code
export function getCourseByCode(courses: Course[], code: string): Course | undefined {
  return courses.find((c) => c.code === code);
}

// Get course level color
export function getCourseLevelColor(level: number): string {
  if (level >= 4000) return '#dc2626'; // red-600
  if (level >= 3000) return '#ea580c'; // orange-600
  if (level >= 2000) return '#ca8a04'; // yellow-600
  return '#16a34a'; // green-600
}


