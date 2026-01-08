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

// Helper function to extract and clean description
function cleanDescription(description: string, code: string): string {
  if (!description) return '';
  
  // Normalize course code for matching (handle spaces)
  const codeNormalized = code.replace(/\s+/g, '\\s*');
  
  // Try multiple patterns to find the course description
  // Pattern 1: Course code [credit] Title\nDescription...
  const pattern1 = new RegExp(`${codeNormalized}\\s*\\[.*?credit.*?\\]\\s*([^\\n]+)\\s*\\n([^]+?)(?=\\n\\n(?:Includes:|Also listed as|Precludes|Prerequisite|Lectures|COMP\\s*\\d{4}|$))`, 'is');
  let match = description.match(pattern1);
  
  if (match && match[2]) {
    // Found description after title
    let desc = match[2].trim();
    
    // Remove trailing metadata sections
    desc = desc.replace(/\n+(?:Includes:|Also listed as|Precludes|Prerequisite|Lectures).*$/is, '');
    // Remove any course codes that appear (indicating next course)
    desc = desc.replace(/\s+COMP\s*\d{4}.*$/i, '');
    
    return desc.trim();
  }
  
  // Pattern 2: Just look for text after the course code that contains actual description
  // Find position of course code
  const codePos = description.search(new RegExp(`${codeNormalized}\\s*\\[.*?credit`, 'i'));
  
  if (codePos !== -1) {
    // Extract text starting from after course code pattern
    let startPos = codePos;
    // Find the end of the credit bracket
    const creditEnd = description.indexOf(']', startPos);
    if (creditEnd !== -1) {
      // Start from after the title (usually first line after credit)
      let descStart = description.indexOf('\n', creditEnd);
      if (descStart === -1) descStart = creditEnd + 1;
      
      // Find where description ends (before metadata or next course)
      const stopMarkers = [
        /(\n|^)Includes:/i,
        /(\n|^)Also listed as/i,
        /(\n|^)Precludes additional credit/i,
        /(\n|^)Prerequisite\(s\):/i,
        /(\n|^)Lectures/i,
        /\nCOMP\s*\d{4}/i // Next course code
      ];
      
      let desc = description.substring(descStart);
      let minEnd = desc.length;
      
      for (const marker of stopMarkers) {
        const markerMatch = desc.search(marker);
        if (markerMatch !== -1 && markerMatch < minEnd) {
          minEnd = markerMatch;
        }
      }
      
      if (minEnd < desc.length) {
        desc = desc.substring(0, minEnd);
      }
      
      // Clean up the description
      desc = desc.trim();
      // Remove leading title if it's duplicated
      desc = desc.replace(/^[A-Z][^.]{0,100}$/m, ''); // Remove single line that looks like a title
      desc = desc.replace(/\n{3,}/g, '\n\n');
      desc = desc.trim();
      
      if (desc.length > 20) { // Only return if we got meaningful content
        return desc;
      }
    }
  }
  
  // Fallback: return original but try to clean it up minimally
  let cleaned = description;
  
  // Only remove clearly identifiable metadata sections, but preserve description content
  // Remove metadata sections that are clearly separated
  cleaned = cleaned.replace(/\n\n(?:Includes:|Also listed as|Precludes|Prerequisite|Lectures).*$/is, '');
  
  // Remove course code and credit info if at the start
  cleaned = cleaned.replace(new RegExp(`^${codeNormalized}\\s*\\[.*?credit.*?\\]\\s*`, 'i'), '');
  
  // Remove any trailing course codes (indicating we went into next course)
  cleaned = cleaned.replace(/\nCOMP\s*\d{4}.*$/i, '').trim();
  
  // Clean up excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
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
    courseMap.set(dbCourse.id, {
      id: dbCourse.id,
      code: dbCourse.code,
      title: dbCourse.title,
      credits: dbCourse.credits,
      description: cleanDescription(dbCourse.description || '', dbCourse.code),
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

