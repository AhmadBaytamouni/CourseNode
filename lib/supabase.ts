import { createClient } from '@supabase/supabase-js';
import { DatabaseCourse, DatabasePrerequisite } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fetch all courses
export async function fetchCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }

  return data as DatabaseCourse[];
}

// Fetch all prerequisites
export async function fetchPrerequisites() {
  const { data, error } = await supabase
    .from('prerequisites')
    .select('*');

  if (error) {
    console.error('Error fetching prerequisites:', error);
    throw error;
  }

  return data as DatabasePrerequisite[];
}

// Fetch course with prerequisites
export async function fetchCourseWithPrerequisites(courseCode: string) {
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('code', courseCode)
    .single();

  if (courseError) {
    console.error('Error fetching course:', courseError);
    throw courseError;
  }

  const { data: prerequisites, error: prereqError } = await supabase
    .from('prerequisites')
    .select('*')
    .eq('course_id', course.id);

  if (prereqError) {
    console.error('Error fetching prerequisites:', prereqError);
    throw prereqError;
  }

  return {
    course: course as DatabaseCourse,
    prerequisites: prerequisites as DatabasePrerequisite[],
  };
}

